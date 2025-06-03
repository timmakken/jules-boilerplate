import asyncio
import unittest
from unittest.mock import patch, AsyncMock, MagicMock
from typing import Dict, Optional, Any # For type hints in mocks

# Ensure image_to_video_service and its dependencies are importable
# Assuming they are in the root directory along with tests, or PYTHONPATH is set.
from image_to_video_service import ImageToVideoService
from runway_client import RunwayMLClient # For type hinting and mocking
# config is used indirectly by ImageToVideoService through RunwayMLClient
from config import get_runway_api_key

# Helper to run async tests if not already in a shared test utils file
def async_test(coro):
    def wrapper(*args, **kwargs):
        loop = asyncio.get_event_loop()
        # Handle cases where the loop might be closed by other tests or test runner quirks
        if loop.is_closed():
            asyncio.set_event_loop(asyncio.new_event_loop())
            loop = asyncio.get_event_loop()
        try:
            return loop.run_until_complete(coro(*args, **kwargs))
        finally:
            # Ensure the loop is properly managed if this test owns its creation
            # For more complex scenarios, a shared loop management might be better.
            pass
    return wrapper

class TestImageToVideoService(unittest.TestCase):

    @patch('image_to_video_service.RunwayMLClient')
    def test_init_success(self, MockRunwayMLClient):
        """Test successful initialization of ImageToVideoService."""
        mock_client_instance = MockRunwayMLClient.return_value
        service = ImageToVideoService(api_key="test_api_key_i2v")

        MockRunwayMLClient.assert_called_once_with(api_key="test_api_key_i2v")
        self.assertIs(service.client, mock_client_instance)

    @patch('runway_client.get_runway_api_key') # Patch where get_runway_api_key is defined and used
    @patch('image_to_video_service.RunwayMLClient') # Patch the client used by the service
    def test_init_api_key_missing(self, MockRunwayMLClient, mock_get_key_from_config):
        """Test initialization failure when API key is missing."""
        # Simulate get_runway_api_key (called by RunwayMLClient constructor) raising ValueError
        mock_get_key_from_config.side_effect = ValueError("RUNWAYML_API_KEY environment variable not set.")

        # Make RunwayMLClient constructor propagate this error
        def client_constructor_effect(api_key=None, api_host=None):
            if api_key is None: # Service passes None, so client tries to get from env
                return mock_get_key_from_config() # This will raise the ValueError
            return MagicMock() # Should not be reached if api_key is None
        MockRunwayMLClient.side_effect = client_constructor_effect

        with self.assertRaisesRegex(ValueError, "RUNWAYML_API_KEY environment variable not set."):
            ImageToVideoService() # Initialize without api_key, so client tries env

        mock_get_key_from_config.assert_called_once()


    @patch('image_to_video_service.RunwayMLClient')
    @async_test
    async def test_submit_image_for_video_generation_success(self, MockRunwayMLClient):
        """Test successful submission of an image for video generation."""
        mock_client_instance = MockRunwayMLClient.return_value
        expected_task_id = "vid_task_123"
        mock_client_instance.generate_video_from_image = AsyncMock(
            return_value={"id": expected_task_id, "status": "QUEUED"}
        )

        service = ImageToVideoService(api_key="fake_key")
        image_url = "http://example.com/image.png"
        user_id = "user001"
        prompt = "A cool animation"
        options = {"seed": 42, "model": "gen3a_turbo"}

        task_id = await service.submit_image_for_video_generation(
            image_url=image_url,
            user_id=user_id,
            prompt_for_video=prompt,
            video_options=options
        )

        mock_client_instance.generate_video_from_image.assert_called_once_with(
            image_url=image_url,
            prompt_for_video=prompt,
            options=options
        )
        self.assertEqual(task_id, expected_task_id)

    @patch('image_to_video_service.RunwayMLClient')
    @async_test
    async def test_submit_image_for_video_generation_client_error(self, MockRunwayMLClient):
        """Test submission failure if the client raises an error."""
        mock_client_instance = MockRunwayMLClient.return_value
        mock_client_instance.generate_video_from_image = AsyncMock(
            side_effect=Exception("Client API error")
        )

        service = ImageToVideoService(api_key="fake_key")
        with self.assertRaisesRegex(Exception, "Client API error"):
            await service.submit_image_for_video_generation(
                image_url="http://example.com/image.png",
                user_id="user002"
            )

    @patch('image_to_video_service.RunwayMLClient')
    @async_test
    async def test_submit_image_for_video_generation_no_task_id(self, MockRunwayMLClient):
        """Test submission failure if response lacks a task ID."""
        mock_client_instance = MockRunwayMLClient.return_value
        mock_client_instance.generate_video_from_image = AsyncMock(
            return_value={"status": "ERROR", "message": "Failed to create task"} # No 'id'
        )

        service = ImageToVideoService(api_key="fake_key")
        with self.assertRaisesRegex(Exception, "Video generation task submission did not return a task ID."):
            await service.submit_image_for_video_generation(
                image_url="http://example.com/image.png",
                user_id="user003"
            )

    @patch('image_to_video_service.RunwayMLClient')
    @async_test
    async def test_check_video_status_success(self, MockRunwayMLClient):
        """Test successfully checking video status."""
        mock_client_instance = MockRunwayMLClient.return_value
        expected_status = {"id": "vid_task_123", "status": "PROCESSING"}
        mock_client_instance.get_task_status = AsyncMock(return_value=expected_status)

        service = ImageToVideoService(api_key="fake_key")
        job_id = "vid_task_123"

        status_response = await service.check_video_status(job_id)

        mock_client_instance.get_task_status.assert_called_once_with(job_id)
        self.assertEqual(status_response, expected_status)

    @patch('image_to_video_service.RunwayMLClient')
    @async_test
    async def test_check_video_status_client_error(self, MockRunwayMLClient):
        """Test video status check failure if client raises an error."""
        mock_client_instance = MockRunwayMLClient.return_value
        mock_client_instance.get_task_status = AsyncMock(side_effect=Exception("Client API error"))

        service = ImageToVideoService(api_key="fake_key")
        with self.assertRaisesRegex(Exception, "Client API error"):
            await service.check_video_status("vid_task_error")


    @patch('image_to_video_service.ImageToVideoService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_success_url_key(self, mock_check_status):
        """Test successful polling and URL extraction (using 'url' key)."""
        service = ImageToVideoService(api_key="fake_key")
        job_id = "vid_task_succeed_url"
        expected_video_url = "http://example.com/video.mp4"

        mock_check_status.side_effect = [
            {"status": "RUNNING"},
            {"status": "SUCCEEDED", "outputs": [{"url": expected_video_url}]}
        ]

        # Override sleep to speed up test
        with patch('asyncio.sleep', return_value=None) as mock_sleep:
            video_url = await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=3)

        self.assertEqual(video_url, expected_video_url)
        self.assertEqual(mock_check_status.call_count, 2)
        mock_check_status.assert_any_call(job_id)
        # mock_sleep will be called once (after RUNNING status)
        self.assertEqual(mock_sleep.call_count, 1)


    @patch('image_to_video_service.ImageToVideoService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_success_uri_key(self, mock_check_status):
        """Test successful polling and URL extraction (using 'uri' key)."""
        service = ImageToVideoService(api_key="fake_key")
        job_id = "vid_task_succeed_uri"
        expected_video_uri = "http://example.com/video.mp4"

        mock_check_status.side_effect = [
            {"status": "PENDING"},
            {"status": "SUCCEEDED", "outputs": [{"uri": expected_video_uri}]}
        ]

        with patch('asyncio.sleep', return_value=None): # Speed up test
            video_url = await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=3)

        self.assertEqual(video_url, expected_video_uri)
        self.assertEqual(mock_check_status.call_count, 2)

    @patch('image_to_video_service.ImageToVideoService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_success_output_singular_key(self, mock_check_status):
        """Test successful polling and URL extraction (using singular 'output.url' key)."""
        service = ImageToVideoService(api_key="fake_key")
        job_id = "vid_task_succeed_output_url"
        expected_video_url = "http://example.com/video_singular.mp4"

        mock_check_status.side_effect = [
            {"status": "RUNNING"},
            {"status": "SUCCEEDED", "output": {"url": expected_video_url}} # singular output
        ]

        with patch('asyncio.sleep', return_value=None):
            video_url = await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=3)

        self.assertEqual(video_url, expected_video_url)
        self.assertEqual(mock_check_status.call_count, 2)


    @patch('image_to_video_service.ImageToVideoService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_failure(self, mock_check_status):
        """Test polling when task FAILED."""
        service = ImageToVideoService(api_key="fake_key")
        job_id = "vid_task_fail"
        error_msg = "Video processing failed due to an error."

        mock_check_status.side_effect = [
            {"status": "RUNNING"},
            {"status": "FAILED", "error_message": error_msg}
            # No third call expected as exception should be raised and terminate polling.
        ]

        with patch('asyncio.sleep', return_value=None): # Mock sleep
            with self.assertRaisesRegex(Exception, f"Video generation task {job_id} failed: {error_msg}"):
                # max_attempts=2 because the failure occurs on the 2nd call.
                await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=2)

        self.assertEqual(mock_check_status.call_count, 2)

    @patch('image_to_video_service.ImageToVideoService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_timeout(self, mock_check_status):
        """Test polling timeout."""
        service = ImageToVideoService(api_key="fake_key")
        job_id = "vid_task_timeout"

        # Always return RUNNING to simulate timeout
        mock_check_status.return_value = {"status": "RUNNING"}

        with patch('asyncio.sleep', return_value=None) as mock_sleep:
            with self.assertRaisesRegex(TimeoutError, f"Polling for video job {job_id} timed out."):
                await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=3)

        self.assertEqual(mock_check_status.call_count, 3) # Called max_attempts times
        self.assertEqual(mock_sleep.call_count, 3) # Slept after each attempt

    @patch('image_to_video_service.ImageToVideoService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_succeeded_no_url(self, mock_check_status):
        """Test task SUCCEEDED but output URL is missing."""
        service = ImageToVideoService(api_key="fake_key")
        job_id = "vid_task_succeed_no_url"

        mock_check_status.return_value = {"status": "SUCCEEDED", "outputs": [{"details": "no url here"}]}

        expected_regex = f"Failed to extract video URL from successful task {job_id}: Video URL/URI not found in task output\\." # Escaped dot
        with self.assertRaisesRegex(Exception, expected_regex):
            # max_attempts=1 as it should fail on the first attempt
            await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=1)

        self.assertEqual(mock_check_status.call_count, 1)

    @patch('image_to_video_service.ImageToVideoService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_succeeded_no_outputs_key(self, mock_check_status):
        """Test task SUCCEEDED but 'outputs' key is missing entirely."""
        service = ImageToVideoService(api_key="fake_key")
        job_id = "vid_task_succeed_no_outputs"

        mock_check_status.return_value = {"status": "SUCCEEDED", "details": "some details, no outputs field"}

        expected_regex = f"Failed to extract video URL from successful task {job_id}: \\\"Neither 'outputs' nor 'output' key found in completed task response\\.\\\""
        with self.assertRaisesRegex(Exception, expected_regex):
            # max_attempts=1 as it should fail on the first attempt due to extraction error
            await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=1)

        self.assertEqual(mock_check_status.call_count, 1)

    @patch('image_to_video_service.ImageToVideoService.check_video_status', new_callable=AsyncMock)
    @async_test
    async def test_get_completed_video_url_unknown_status(self, mock_check_status):
        """Test polling when task returns an unknown status."""
        service = ImageToVideoService(api_key="fake_key")
        job_id = "vid_task_unknown"
        unknown_status = "MYSTERY_STATUS"

        mock_check_status.return_value = {"status": unknown_status}

        with patch('asyncio.sleep', return_value=None): # Mock sleep as it might be called if retried
            with self.assertRaisesRegex(Exception, f"Task {job_id} returned an unknown status: {unknown_status}"):
                 # max_attempts=1 as it should fail on the first attempt
                await service.get_completed_video_url(job_id, poll_interval_seconds=0.01, max_attempts=1)

        self.assertEqual(mock_check_status.call_count, 1) # Fails on first unknown status


if __name__ == '__main__':
    unittest.main()
