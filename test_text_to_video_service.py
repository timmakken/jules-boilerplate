import asyncio
import unittest
from unittest.mock import patch, AsyncMock, MagicMock, PropertyMock

# Ensure text_to_video_service and its dependencies are importable
from text_to_video_service import TextToVideoService
from runway_client import RunwayMLClient # Used for type hinting and mocking
# config is used indirectly by TextToVideoService through RunwayMLClient
from config import get_runway_api_key

# Helper to run async tests
def async_test(coro):
    def wrapper(*args, **kwargs):
        loop = asyncio.get_event_loop()
        try:
            return loop.run_until_complete(coro(*args, **kwargs))
        except RuntimeError as e:
            if "Event loop is closed" in str(e) and not loop.is_closed():
                pass
            else:
                if not loop.is_closed():
                    loop.close()
                raise
    return wrapper

class TestTextToVideoService(unittest.TestCase):

    @patch('text_to_video_service.RunwayMLClient')
    def test_init_success(self, MockRunwayMLClient):
        mock_client_instance = MockRunwayMLClient.return_value
        service = TextToVideoService(api_key="test_key_service")

        MockRunwayMLClient.assert_called_once_with(api_key="test_key_service")
        # self.assertIsInstance(service.runway_client, MockRunwayMLClient) # This check is problematic

    @patch('runway_client.get_runway_api_key') # Patch the original get_runway_api_key
    @patch('text_to_video_service.RunwayMLClient') # Mock the client class itself
    def test_init_api_key_missing_from_env(self, MockRunwayMLClient, mock_get_runway_api_key_actual):
        # This is what RunwayMLClient's __init__ will call if api_key is not provided.
        mock_get_runway_api_key_actual.side_effect = ValueError("RUNWAYML_API_KEY environment variable not set.")

        # Define a side effect for the RunwayMLClient constructor
        # to simulate its actual behavior regarding api_key.
        def mock_client_constructor(api_key=None, api_host=None):
            if api_key is None:
                # This simulates the client trying to fetch the key from env, which will fail due to the patch
                mock_get_runway_api_key_actual()
            # Normally, the constructor would proceed or raise the error from get_runway_api_key.
            # For this test, we want the error from get_runway_api_key_actual to propagate.
            # So, if get_runway_api_key_actual raised, it will stop here.
            # If it didn't (e.g. if api_key was provided), return a new mock.
            return MagicMock()

        MockRunwayMLClient.side_effect = mock_client_constructor

        with self.assertRaises(ValueError) as cm:
            TextToVideoService() # Initialize without api_key, client will try env via get_runway_api_key

        self.assertEqual(str(cm.exception), "RUNWAYML_API_KEY environment variable not set.")
        mock_get_runway_api_key_actual.assert_called_once()

    @patch('text_to_video_service.RunwayMLClient')
    @async_test
    async def test_poll_task_until_succeeded(self, MockRunwayMLClient):
        mock_client = MockRunwayMLClient.return_value
        mock_client.get_task_status = AsyncMock(side_effect=[
            {"id": "task1", "status": "RUNNING"},
            {"id": "task1", "status": "SUCCEEDED", "outputs": [{"url": "http://example.com/file.mp4"}]}
        ])

        service = TextToVideoService(api_key="fake_key")
        service.poll_interval_seconds = 0.01 # Speed up polling for test

        task_id = "task1"
        result = await service._poll_task_until_completed(task_id)

        self.assertEqual(result["status"], "SUCCEEDED")
        self.assertEqual(result["outputs"][0]["url"], "http://example.com/file.mp4")
        self.assertEqual(mock_client.get_task_status.call_count, 2)
        mock_client.get_task_status.assert_any_call(task_id)


    @patch('text_to_video_service.RunwayMLClient')
    @async_test
    async def test_poll_task_until_failed(self, MockRunwayMLClient):
        mock_client = MockRunwayMLClient.return_value
        mock_client.get_task_status = AsyncMock(side_effect=[
            {"id": "task_fail", "status": "RUNNING"},
            {"id": "task_fail", "status": "FAILED", "error_message": "It broke"}
        ])

        service = TextToVideoService(api_key="fake_key")
        service.poll_interval_seconds = 0.01

        with self.assertRaisesRegex(Exception, "Task task_fail failed: It broke"):
            await service._poll_task_until_completed("task_fail")

        self.assertEqual(mock_client.get_task_status.call_count, 2)

    @patch('text_to_video_service.RunwayMLClient')
    @async_test
    async def test_poll_task_timeout(self, MockRunwayMLClient):
        mock_client = MockRunwayMLClient.return_value
        mock_client.get_task_status = AsyncMock(return_value={"id": "task_timeout", "status": "RUNNING"})

        service = TextToVideoService(api_key="fake_key")
        service.poll_interval_seconds = 0.01
        service.max_polling_attempts = 3 # Force timeout

        with self.assertRaisesRegex(TimeoutError, "Task task_timeout did not complete within the allowed time."):
            await service._poll_task_until_completed("task_timeout")

        self.assertEqual(mock_client.get_task_status.call_count, 3)

    @patch('text_to_video_service.RunwayMLClient')
    @async_test
    async def test_generate_initial_image_success(self, MockRunwayMLClient):
        mock_client = MockRunwayMLClient.return_value
        mock_client.generate_image_from_text = AsyncMock(return_value={"id": "img_task_id"})
        # Simulate polling: PENDING -> SUCCEEDED
        mock_client.get_task_status = AsyncMock(side_effect=[
            {"id": "img_task_id", "status": "PENDING"},
            {"id": "img_task_id", "status": "SUCCEEDED", "outputs": [{"url": "http://example.com/image.png"}]}
        ])

        service = TextToVideoService(api_key="fake_key")
        service.poll_interval_seconds = 0.01
        prompt = "A beautiful landscape"

        image_url = await service._generate_initial_image_and_get_url(prompt)

        self.assertEqual(image_url, "http://example.com/image.png")
        mock_client.generate_image_from_text.assert_called_once_with(prompt, options=None)
        self.assertEqual(mock_client.get_task_status.call_count, 2)

    @patch('text_to_video_service.RunwayMLClient')
    @async_test
    async def test_generate_initial_image_failure_at_submission(self, MockRunwayMLClient):
        mock_client = MockRunwayMLClient.return_value
        mock_client.generate_image_from_text = AsyncMock(side_effect=Exception("Submission failed"))

        service = TextToVideoService(api_key="fake_key")
        with self.assertRaisesRegex(Exception, "Submission failed"):
            await service._generate_initial_image_and_get_url("A prompt")

    @patch('text_to_video_service.RunwayMLClient')
    @async_test
    async def test_generate_initial_image_failure_during_polling(self, MockRunwayMLClient):
        mock_client = MockRunwayMLClient.return_value
        mock_client.generate_image_from_text = AsyncMock(return_value={"id": "img_task_id"})
        mock_client.get_task_status = AsyncMock(return_value={"id": "img_task_id", "status": "FAILED", "error_message": "Image gen error"})

        service = TextToVideoService(api_key="fake_key")
        service.poll_interval_seconds = 0.01
        with self.assertRaisesRegex(Exception, "Task img_task_id failed: Image gen error"):
            await service._generate_initial_image_and_get_url("A prompt")

    @patch('text_to_video_service.TextToVideoService._generate_initial_image_and_get_url', new_callable=AsyncMock)
    @patch('text_to_video_service.RunwayMLClient')
    @async_test
    async def test_submit_text_prompt_for_video_generation_success(
        self, MockRunwayMLClient, mock_generate_image_url):

        mock_client_instance = MockRunwayMLClient.return_value # Get the instance of the mocked client
        service = TextToVideoService(api_key="fake_key") # This will use the mocked client instance

        # Configure mocks
        mock_generate_image_url.return_value = "http://example.com/generated_image.png"
        mock_client_instance.generate_video_from_image = AsyncMock(return_value={"id": "video_task_id_123"})

        prompt = "A dancing robot"
        user_id = "test_user"
        image_opts = {"style": "cartoon"}
        video_opts = {"length": "10s"}

        video_task_id = await service.submit_text_prompt_for_video_generation(
            prompt, user_id, image_options=image_opts, video_options=video_opts
        )

        self.assertEqual(video_task_id, "video_task_id_123")
        mock_generate_image_url.assert_called_once_with(prompt, image_gen_options=image_opts)
        mock_client_instance.generate_video_from_image.assert_called_once_with(
            image_url="http://example.com/generated_image.png",
            prompt_for_video=prompt,
            options=video_opts
        )

    @patch('text_to_video_service.TextToVideoService._generate_initial_image_and_get_url', new_callable=AsyncMock)
    @patch('text_to_video_service.RunwayMLClient')
    @async_test
    async def test_submit_text_prompt_image_gen_fails(self, MockRunwayMLClient, mock_generate_image_url):
        # No need to mock client instance if we only mock TextToVideoService methods
        service = TextToVideoService(api_key="fake_key")
        mock_generate_image_url.side_effect = Exception("Image generation failed")

        with self.assertRaisesRegex(Exception, "Image generation failed"):
            await service.submit_text_prompt_for_video_generation("prompt", "user")

        mock_generate_image_url.assert_called_once()
        # Ensure generate_video_from_image was not called
        self.assertFalse(service.runway_client.generate_video_from_image.called)


    @patch('text_to_video_service.TextToVideoService._generate_initial_image_and_get_url', new_callable=AsyncMock)
    @patch('text_to_video_service.RunwayMLClient') # Mock the client class
    @async_test
    async def test_submit_text_prompt_video_submission_fails(self, MockRunwayMLClient, mock_generate_image_url):
        mock_client_instance = MockRunwayMLClient.return_value # Get the instance
        service = TextToVideoService(api_key="fake_key") # Service will use this instance

        mock_generate_image_url.return_value = "http://example.com/image.png"
        mock_client_instance.generate_video_from_image = AsyncMock(side_effect=Exception("Video submission failed"))

        with self.assertRaisesRegex(Exception, "Video submission failed"):
            await service.submit_text_prompt_for_video_generation("prompt", "user")

        mock_generate_image_url.assert_called_once()
        mock_client_instance.generate_video_from_image.assert_called_once()


    @patch('text_to_video_service.RunwayMLClient')
    @async_test
    async def test_check_video_status(self, MockRunwayMLClient):
        mock_client = MockRunwayMLClient.return_value
        expected_status = {"id": "vid_job_1", "status": "PROCESSING"}
        mock_client.get_task_status = AsyncMock(return_value=expected_status)

        service = TextToVideoService(api_key="fake_key")
        video_job_id = "vid_job_1"

        status = await service.check_video_status(video_job_id)

        self.assertEqual(status, expected_status)
        mock_client.get_task_status.assert_called_once_with(video_job_id)

    @patch('text_to_video_service.RunwayMLClient')
    @async_test
    async def test_generate_initial_image_output_url_formats(self, MockRunwayMLClient):
        mock_client = MockRunwayMLClient.return_value
        service = TextToVideoService(api_key="fake_key")
        service.poll_interval_seconds = 0.01
        prompt = "Test prompt"

        # Test with 'outputs'[0]['url']
        mock_client.generate_image_from_text = AsyncMock(return_value={"id": "task_url"})
        mock_client.get_task_status = AsyncMock(return_value={
            "id": "task_url", "status": "SUCCEEDED", "outputs": [{"url": "http://example.com/url_format.png"}]
        })
        image_url = await service._generate_initial_image_and_get_url(prompt)
        self.assertEqual(image_url, "http://example.com/url_format.png")

        # Test with 'outputs'[0]['uri']
        mock_client.generate_image_from_text = AsyncMock(return_value={"id": "task_uri"})
        mock_client.get_task_status = AsyncMock(return_value={
            "id": "task_uri", "status": "SUCCEEDED", "outputs": [{"uri": "http://example.com/uri_format.png"}]
        })
        image_url = await service._generate_initial_image_and_get_url(prompt)
        self.assertEqual(image_url, "http://example.com/uri_format.png")

        # Test with 'output' (singular) as a dictionary
        mock_client.generate_image_from_text = AsyncMock(return_value={"id": "task_output_dict"})
        mock_client.get_task_status = AsyncMock(return_value={
            "id": "task_output_dict", "status": "SUCCEEDED", "output": {"url": "http://example.com/output_dict.png"}
        })
        image_url = await service._generate_initial_image_and_get_url(prompt)
        self.assertEqual(image_url, "http://example.com/output_dict.png")

        # Test with 'output' (singular) as a list
        mock_client.generate_image_from_text = AsyncMock(return_value={"id": "task_output_list"})
        mock_client.get_task_status = AsyncMock(return_value={
            "id": "task_output_list", "status": "SUCCEEDED", "output": [{"uri": "http://example.com/output_list.png"}]
        })
        image_url = await service._generate_initial_image_and_get_url(prompt)
        self.assertEqual(image_url, "http://example.com/output_list.png")

        # Test with missing URL/URI
        mock_client.generate_image_from_text = AsyncMock(return_value={"id": "task_nourl"})
        mock_client.get_task_status = AsyncMock(return_value={
            "id": "task_nourl", "status": "SUCCEEDED", "outputs": [{"details": "no url here"}]
        })
        with self.assertRaisesRegex(Exception, "Failed to extract image URL from task output: Image URL not found in task output."):
            await service._generate_initial_image_and_get_url(prompt)

        # Test with missing 'outputs' and 'output'
        mock_client.generate_image_from_text = AsyncMock(return_value={"id": "task_no_outputs_key"})
        mock_client.get_task_status = AsyncMock(return_value={
            "id": "task_no_outputs_key", "status": "SUCCEEDED", "details": "some details"
        })
        # Update the regex to be less fragile regarding the exact format of the logged dictionary.
        expected_error_regex = (
            r"Failed to extract image URL from task output: "
            r"\"Neither 'outputs' nor 'output' key found in completed task response\.\".*" # Ensures the main message
            r"task_no_outputs_key" # And that the specific task ID is mentioned in the rest
        )
        with self.assertRaisesRegex(Exception, expected_error_regex):
            await service._generate_initial_image_and_get_url(prompt)


if __name__ == '__main__':
    unittest.main()
