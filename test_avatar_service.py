import asyncio
import unittest
from unittest.mock import patch, AsyncMock, MagicMock
from typing import Dict, Optional, Any

# Ensure avatar_service and its dependencies are importable
from avatar_service import AvatarService
from did_client import DIDClient # For type hinting and mocking
from config import get_did_api_key

# Helper to run async tests
def async_test(coro):
    def wrapper(*args, **kwargs):
        loop = asyncio.new_event_loop()  # Create a new loop
        asyncio.set_event_loop(loop)     # Set it as the current loop
        try:
            return loop.run_until_complete(coro(*args, **kwargs))
        finally:
            loop.close()                 # Ensure the loop is closed
    return wrapper

class TestAvatarService(unittest.TestCase):

    @patch('avatar_service.DIDClient')
    def test_init_success(self, MockDIDClient):
        """Test successful initialization of AvatarService."""
        mock_client_instance = MockDIDClient.return_value
        service = AvatarService(api_key="test_api_key_avatar")

        MockDIDClient.assert_called_once_with(api_key="test_api_key_avatar")
        self.assertIs(service.client, mock_client_instance)

    @patch('config.get_did_api_key') # Patch where get_did_api_key is defined
    @patch('avatar_service.DIDClient') # Patch the client used by the service
    def test_init_api_key_missing(self, MockDIDClient, mock_get_key_from_config):
        """Test initialization failure when API key is missing."""
        mock_get_key_from_config.side_effect = ValueError("DID_API_KEY environment variable not set.")

        # Make DIDClient constructor propagate this error
        def client_constructor_effect(api_key=None, api_host=None):
            if api_key is None:
                return mock_get_key_from_config()
            return MagicMock()
        MockDIDClient.side_effect = client_constructor_effect

        with self.assertRaisesRegex(ValueError, "DID_API_KEY environment variable not set."):
            AvatarService()

        mock_get_key_from_config.assert_called_once()

    @patch('avatar_service.DIDClient')
    @async_test
    async def test_submit_avatar_talk_job_success(self, MockDIDClient):
        """Test successful submission of an avatar talk job."""
        mock_client_instance = MockDIDClient.return_value
        expected_task_id = "tlk_xyz789"
        mock_client_instance.create_talk = AsyncMock(
            return_value={"id": expected_task_id, "status": "created"}
        )

        service = AvatarService(api_key="fake_key")
        image_url = "http://example.com/avatar_image.jpg"
        text_to_speak = "Hello, this is a test."
        user_id = "test_user_001"
        voice_id = "en-US-CustomVoice"
        provider_type = "custom_tts_provider"
        avatar_options = {"config": {"result_format": "webm"}}

        expected_provider_config = {'type': provider_type, 'voice_id': voice_id}

        task_id = await service.submit_avatar_talk_job(
            image_url=image_url,
            text_to_speak=text_to_speak,
            user_id=user_id,
            voice_id=voice_id,
            provider_type=provider_type,
            avatar_options=avatar_options
        )

        mock_client_instance.create_talk.assert_called_once_with(
            image_url=image_url,
            script_text=text_to_speak,
            provider_config=expected_provider_config,
            talk_config=avatar_options
        )
        self.assertEqual(task_id, expected_task_id)

    @patch('avatar_service.DIDClient')
    @async_test
    async def test_submit_avatar_talk_job_default_voice_provider(self, MockDIDClient):
        """Test job submission with default voice and provider."""
        mock_client_instance = MockDIDClient.return_value
        mock_client_instance.create_talk = AsyncMock(return_value={"id": "tlk_defaults", "status": "created"})
        service = AvatarService(api_key="fake_key")

        await service.submit_avatar_talk_job(
            image_url="img.png", text_to_speak="hello", user_id="def_user"
        )

        expected_provider_config = {'type': 'microsoft', 'voice_id': 'en-US-JennyNeural'}
        mock_client_instance.create_talk.assert_called_once_with(
            image_url="img.png",
            script_text="hello",
            provider_config=expected_provider_config,
            talk_config=None
        )

    @patch('avatar_service.DIDClient')
    @async_test
    async def test_submit_avatar_talk_job_client_error(self, MockDIDClient):
        """Test submission failure if the client call fails."""
        mock_client_instance = MockDIDClient.return_value
        mock_client_instance.create_talk = AsyncMock(side_effect=Exception("D-ID Client Error"))
        service = AvatarService(api_key="fake_key")
        with self.assertRaisesRegex(Exception, "D-ID Client Error"):
            await service.submit_avatar_talk_job("img.png", "text", "user_err")

    @patch('avatar_service.DIDClient')
    @async_test
    async def test_submit_avatar_talk_job_no_task_id_response(self, MockDIDClient):
        """Test submission failure if client response lacks task ID."""
        mock_client_instance = MockDIDClient.return_value
        mock_client_instance.create_talk = AsyncMock(return_value={"status": "error"}) # No 'id'
        service = AvatarService(api_key="fake_key")
        with self.assertRaisesRegex(Exception, "Avatar talk job submission did not return a task ID."):
            await service.submit_avatar_talk_job("img.png", "text", "user_no_id")

    @patch('avatar_service.DIDClient')
    @async_test
    async def test_check_avatar_video_status_success(self, MockDIDClient):
        """Test successfully checking avatar video status."""
        mock_client_instance = MockDIDClient.return_value
        expected_status = {"id": "tlk_xyz789", "status": "done", "result_url": "video.mp4"}
        mock_client_instance.get_talk_status = AsyncMock(return_value=expected_status)
        service = AvatarService(api_key="fake_key")
        job_id = "tlk_xyz789"
        status_response = await service.check_avatar_video_status(job_id)
        mock_client_instance.get_talk_status.assert_called_once_with(job_id)
        self.assertEqual(status_response, expected_status)

    # Polling tests for get_completed_avatar_video_url
    @patch('avatar_service.AvatarService.check_avatar_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_avatar_video_url_success(self, mock_check_status):
        """Test successful polling for avatar video URL."""
        service = AvatarService(api_key="fake_key")
        job_id = "tlk_done_123"
        expected_url = "http://example.com/avatar_video.mp4"
        mock_check_status.side_effect = [
            {"status": "created"},
            {"status": "started"},
            {"status": "done", "result_url": expected_url}
        ]
        with patch('asyncio.sleep', return_value=None) as mock_sleep:
            video_url = await service.get_completed_avatar_video_url(job_id, poll_interval_seconds=0.01, max_attempts=4)
        self.assertEqual(video_url, expected_url)
        self.assertEqual(mock_check_status.call_count, 3)
        self.assertEqual(mock_sleep.call_count, 2) # Called after 'created' and 'started'

    @patch('avatar_service.AvatarService.check_avatar_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_avatar_video_url_failure_error_status(self, mock_check_status):
        """Test polling when task status is 'error'."""
        service = AvatarService(api_key="fake_key")
        job_id = "tlk_err_456"
        error_message = "An error occurred during processing."
        mock_check_status.side_effect = [
            {"status": "started"},
            {"status": "error", "error": error_message}
        ]
        with patch('asyncio.sleep', return_value=None):
            with self.assertRaisesRegex(Exception, f"Avatar video generation task {job_id} failed \(status: error\): {error_message}"):
                await service.get_completed_avatar_video_url(job_id, poll_interval_seconds=0.01, max_attempts=2)
        self.assertEqual(mock_check_status.call_count, 2)

    @patch('avatar_service.AvatarService.check_avatar_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_avatar_video_url_failure_rejected_status(self, mock_check_status):
        """Test polling when task status is 'rejected'."""
        service = AvatarService(api_key="fake_key")
        job_id = "tlk_reject_789"
        # D-ID sometimes puts rejection details in result.description or result.error
        rejection_details = {"description": "Content rejected by policy."}
        mock_check_status.side_effect = [
            {"status": "created"},
            {"status": "rejected", "result": rejection_details}
        ]
        with patch('asyncio.sleep', return_value=None):
            with self.assertRaisesRegex(Exception, f"Avatar video generation task {job_id} failed \(status: rejected\): {rejection_details['description']}"):
                await service.get_completed_avatar_video_url(job_id, poll_interval_seconds=0.01, max_attempts=2)
        self.assertEqual(mock_check_status.call_count, 2)


    @patch('avatar_service.AvatarService.check_avatar_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_avatar_video_url_timeout(self, mock_check_status):
        """Test polling timeout for avatar video job."""
        service = AvatarService(api_key="fake_key")
        job_id = "tlk_timeout_101"
        mock_check_status.return_value = {"status": "started"} # Always started
        with patch('asyncio.sleep', return_value=None) as mock_sleep:
            with self.assertRaisesRegex(TimeoutError, f"Polling for avatar video job {job_id} timed out."):
                await service.get_completed_avatar_video_url(job_id, poll_interval_seconds=0.01, max_attempts=3)
        self.assertEqual(mock_check_status.call_count, 3)
        self.assertEqual(mock_sleep.call_count, 3)

    @patch('avatar_service.AvatarService.check_avatar_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_avatar_video_url_done_no_result_url(self, mock_check_status):
        """Test task 'done' but result_url is missing."""
        service = AvatarService(api_key="fake_key")
        job_id = "tlk_done_no_url"
        mock_check_status.return_value = {"status": "done", "id": job_id} # No result_url
        with self.assertRaisesRegex(ValueError, "'result_url' not found in successful task output."):
            await service.get_completed_avatar_video_url(job_id, poll_interval_seconds=0.01, max_attempts=1)
        self.assertEqual(mock_check_status.call_count, 1)

if __name__ == '__main__':
    unittest.main()
