import asyncio
import unittest
from unittest.mock import patch, AsyncMock, MagicMock
from typing import Dict, Optional, Any # For type hints in mocks

# Ensure video_style_transfer_service and its dependencies are importable
from video_style_transfer_service import VideoStyleTransferService
from runway_client import RunwayMLClient # For type hinting and mocking
from config import get_runway_api_key

# Helper to run async tests (can be shared if in a common test utils)
def async_test(coro):
    def wrapper(*args, **kwargs):
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            asyncio.set_event_loop(asyncio.new_event_loop())
            loop = asyncio.get_event_loop()
        try:
            return loop.run_until_complete(coro(*args, **kwargs))
        finally:
            pass
    return wrapper

class TestVideoStyleTransferService(unittest.TestCase):

    @patch('video_style_transfer_service.RunwayMLClient')
    def test_init_success(self, MockRunwayMLClient):
        """Test successful initialization of VideoStyleTransferService."""
        mock_client_instance = MockRunwayMLClient.return_value
        service = VideoStyleTransferService(api_key="test_api_key_vsts")

        MockRunwayMLClient.assert_called_once_with(api_key="test_api_key_vsts")
        self.assertIs(service.client, mock_client_instance)
        self.assertEqual(service.style_image_param_name, "style_reference_image_url")

    @patch('runway_client.get_runway_api_key')
    @patch('video_style_transfer_service.RunwayMLClient')
    def test_init_api_key_missing(self, MockRunwayMLClient, mock_get_key_from_config):
        """Test initialization failure when API key is missing."""
        mock_get_key_from_config.side_effect = ValueError("RUNWAYML_API_KEY environment variable not set.")

        def client_constructor_effect(api_key=None, api_host=None):
            if api_key is None:
                return mock_get_key_from_config()
            return MagicMock()
        MockRunwayMLClient.side_effect = client_constructor_effect

        with self.assertRaisesRegex(ValueError, "RUNWAYML_API_KEY environment variable not set."):
            VideoStyleTransferService()

        mock_get_key_from_config.assert_called_once()

    @patch('video_style_transfer_service.RunwayMLClient')
    @async_test
    async def test_submit_style_transfer_job_success(self, MockRunwayMLClient):
        """Test successful submission of a style transfer job."""
        mock_client_instance = MockRunwayMLClient.return_value
        expected_task_id = "style_task_456"
        mock_client_instance.generate_video_from_image = AsyncMock(
            return_value={"id": expected_task_id, "status": "QUEUED"}
        )

        service = VideoStyleTransferService(api_key="fake_key")
        input_image_url = "http://example.com/input.png"
        style_image_url = "http://example.com/style.jpg"
        user_id = "user_style_001"
        prompt = "A vibrant animation"
        video_options = {"seed": 123, "model": "gen4_turbo_style_transfer"} # User provided options

        # Expected options to be passed to the client method
        expected_client_options = video_options.copy()
        expected_client_options[service.style_image_param_name] = style_image_url

        task_id = await service.submit_style_transfer_job(
            input_image_url=input_image_url,
            style_image_url=style_image_url,
            user_id=user_id,
            prompt=prompt,
            video_options=video_options
        )

        mock_client_instance.generate_video_from_image.assert_called_once_with(
            image_url=input_image_url,
            prompt_for_video=prompt,
            options=expected_client_options
        )
        self.assertEqual(task_id, expected_task_id)

    @patch('video_style_transfer_service.RunwayMLClient')
    @async_test
    async def test_submit_style_transfer_job_no_video_options(self, MockRunwayMLClient):
        """Test job submission when no initial video_options are provided."""
        mock_client_instance = MockRunwayMLClient.return_value
        expected_task_id = "style_task_789"
        mock_client_instance.generate_video_from_image = AsyncMock(
            return_value={"id": expected_task_id, "status": "QUEUED"}
        )
        service = VideoStyleTransferService(api_key="fake_key")
        input_image_url = "http://example.com/input2.png"
        style_image_url = "http://example.com/style2.jpg"
        user_id = "user_style_002"

        expected_client_options = {service.style_image_param_name: style_image_url}

        task_id = await service.submit_style_transfer_job(
            input_image_url=input_image_url,
            style_image_url=style_image_url,
            user_id=user_id
        )
        mock_client_instance.generate_video_from_image.assert_called_once_with(
            image_url=input_image_url,
            prompt_for_video=None,
            options=expected_client_options
        )
        self.assertEqual(task_id, expected_task_id)


    @patch('video_style_transfer_service.RunwayMLClient')
    @async_test
    async def test_submit_style_transfer_job_client_error(self, MockRunwayMLClient):
        """Test submission failure if client raises an error."""
        mock_client_instance = MockRunwayMLClient.return_value
        mock_client_instance.generate_video_from_image = AsyncMock(
            side_effect=Exception("Client API error for style transfer")
        )
        service = VideoStyleTransferService(api_key="fake_key")
        with self.assertRaisesRegex(Exception, "Client API error for style transfer"):
            await service.submit_style_transfer_job(
                input_image_url="in.png", style_image_url="style.png", user_id="err_user"
            )

    @patch('video_style_transfer_service.RunwayMLClient')
    @async_test
    async def test_submit_style_transfer_job_no_task_id(self, MockRunwayMLClient):
        """Test submission failure if response lacks a task ID."""
        mock_client_instance = MockRunwayMLClient.return_value
        mock_client_instance.generate_video_from_image = AsyncMock(
            return_value={"status": "ERROR"} # No 'id'
        )
        service = VideoStyleTransferService(api_key="fake_key")
        with self.assertRaisesRegex(Exception, "Style transfer task submission did not return a task ID."):
            await service.submit_style_transfer_job(
                input_image_url="in.png", style_image_url="style.png", user_id="no_id_user"
            )

    @patch('video_style_transfer_service.RunwayMLClient')
    @async_test
    async def test_check_video_status_success(self, MockRunwayMLClient):
        """Test successfully checking style transfer video status."""
        mock_client_instance = MockRunwayMLClient.return_value
        expected_status = {"id": "style_task_456", "status": "SUCCEEDED"}
        mock_client_instance.get_task_status = AsyncMock(return_value=expected_status)
        service = VideoStyleTransferService(api_key="fake_key")
        job_id = "style_task_456"
        status_response = await service.check_video_status(job_id)
        mock_client_instance.get_task_status.assert_called_once_with(job_id)
        self.assertEqual(status_response, expected_status)

    # Polling tests for get_completed_video_url (similar to ImageToVideoService tests)
    # These will mock check_video_status directly on the service instance for simplicity

    @patch('video_style_transfer_service.VideoStyleTransferService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_success(self, mock_check_status):
        """Test successful polling for style transfer video URL."""
        service = VideoStyleTransferService(api_key="fake_key")
        job_id = "style_job_complete"
        expected_url = "http://example.com/stylized_video.mp4"
        mock_check_status.side_effect = [
            {"status": "RUNNING"},
            {"status": "SUCCEEDED", "outputs": [{"url": expected_url}]}
        ]
        with patch('asyncio.sleep', return_value=None) as mock_sleep:
            video_url = await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=3)
        self.assertEqual(video_url, expected_url)
        self.assertEqual(mock_check_status.call_count, 2)
        mock_sleep.assert_called_once()

    @patch('video_style_transfer_service.VideoStyleTransferService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_failure(self, mock_check_status):
        """Test polling for style transfer when task FAILED."""
        service = VideoStyleTransferService(api_key="fake_key")
        job_id = "style_job_fail"
        error_message = "Style transfer process failed."
        mock_check_status.side_effect = [
            {"status": "RUNNING"},
            {"status": "FAILED", "error_message": error_message}
        ]
        with patch('asyncio.sleep', return_value=None):
            with self.assertRaisesRegex(Exception, f"Style transfer video generation task {job_id} failed: {error_message}"):
                await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=2)
        self.assertEqual(mock_check_status.call_count, 2)

    @patch('video_style_transfer_service.VideoStyleTransferService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_timeout(self, mock_check_status):
        """Test polling timeout for style transfer job."""
        service = VideoStyleTransferService(api_key="fake_key")
        job_id = "style_job_timeout"
        mock_check_status.return_value = {"status": "RUNNING"} # Always running
        with patch('asyncio.sleep', return_value=None) as mock_sleep:
            with self.assertRaisesRegex(TimeoutError, f"Polling for style transfer video job {job_id} timed out."):
                await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=3)
        self.assertEqual(mock_check_status.call_count, 3)
        self.assertEqual(mock_sleep.call_count, 3)

    @patch('video_style_transfer_service.VideoStyleTransferService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_succeeded_no_url(self, mock_check_status):
        """Test style transfer SUCCEEDED but output URL is missing."""
        service = VideoStyleTransferService(api_key="fake_key")
        job_id = "style_job_no_url"
        mock_check_status.return_value = {"status": "SUCCEEDED", "outputs": [{"details": "no url here"}]}
        expected_regex = f"Failed to extract video URL from successful task {job_id}: Video URL/URI not found in task output\\."
        with self.assertRaisesRegex(Exception, expected_regex):
            await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=1)
        self.assertEqual(mock_check_status.call_count, 1)

    @patch('video_style_transfer_service.VideoStyleTransferService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_succeeded_no_outputs_key(self, mock_check_status):
        """Test style transfer SUCCEEDED but 'outputs' key is missing."""
        service = VideoStyleTransferService(api_key="fake_key")
        job_id = "style_job_no_outputs_key"
        mock_check_status.return_value = {"status": "SUCCEEDED", "details": "missing outputs"}
        expected_regex = f"Failed to extract video URL from successful task {job_id}: \\\"Neither 'outputs' nor 'output' key found in completed task response\\.\\\""
        with self.assertRaisesRegex(Exception, expected_regex):
            await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=1)
        self.assertEqual(mock_check_status.call_count, 1)


if __name__ == '__main__':
    unittest.main()
