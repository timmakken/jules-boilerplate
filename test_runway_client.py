import asyncio
import unittest
from unittest.mock import patch, AsyncMock, MagicMock
import aiohttp

# Make sure runway_client and config are importable.
# If they are in the root directory, this should work directly.
# Otherwise, sys.path might need adjustment for the test environment.
from runway_client import RunwayMLClient, RUNWAYML_API_BASE_URL
from config import get_runway_api_key

# Helper to run async tests
def async_test(coro):
    def wrapper(*args, **kwargs):
        loop = asyncio.get_event_loop()
        try:
            return loop.run_until_complete(coro(*args, **kwargs))
        except RuntimeError as e: # Handle "Event loop is closed" if tests run in certain ways
            if "Event loop is closed" in str(e) and not loop.is_closed():
                pass # Potentially ignore if loop is closed by test runner
            else:
                # If loop is not closed, or it's a different RuntimeError, re-raise
                if not loop.is_closed():
                    loop.close() # Attempt to close before re-raising
                raise
    return wrapper

class TestRunwayMLClient(unittest.TestCase):

    @patch('runway_client.get_runway_api_key', return_value="test_api_key")
    def test_init_with_key_from_env(self, mock_get_key):
        client = RunwayMLClient()
        self.assertEqual(client.api_key, "test_api_key")
        self.assertEqual(client.api_host, RUNWAYML_API_BASE_URL)
        self.assertIn("Authorization", client.headers)
        self.assertEqual(client.headers["Authorization"], "Bearer test_api_key")
        mock_get_key.assert_called_once()

    def test_init_with_provided_key(self):
        client = RunwayMLClient(api_key="provided_key", api_host="http://custom.host")
        self.assertEqual(client.api_key, "provided_key")
        self.assertEqual(client.api_host, "http://custom.host")
        self.assertEqual(client.headers["Authorization"], "Bearer provided_key")

    @patch('runway_client.aiohttp.ClientSession')
    @async_test
    async def test_generate_image_from_text_success(self, MockClientSession): # Reverted name for consistency
        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 200
        http_response_mock.json = AsyncMock(return_value={"id": "img_task_123", "status": "QUEUED"})
        http_response_mock.raise_for_status = MagicMock()

        # This is the async context manager returned by session.request(...)
        request_context_mock = AsyncMock()
        request_context_mock.__aenter__.return_value = http_response_mock
        request_context_mock.__aexit__.return_value = None # Needs to be an awaitable

        # This is the session object itself, after `async with ClientSession() as session:`
        session_mock = AsyncMock()
        session_mock.request = MagicMock(return_value=request_context_mock) # Key change: MagicMock

        # Configure the ClientSession() constructor call
        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None) # Explicitly AsyncMock

        client = RunwayMLClient(api_key="test_key")
        prompt = "A cat playing a piano"
        options = {"ratio": "16:9"}

        response = await client.generate_image_from_text(prompt, options)

        session_mock.request.assert_called_once_with(
            "POST",
            f"{RUNWAYML_API_BASE_URL}/v1/tasks",
            headers=client.headers,
            json={"model": "gen4_image", "prompt": prompt, "ratio": "16:9"}
        )
        self.assertEqual(response, {"id": "img_task_123", "status": "QUEUED"})

    @patch('runway_client.aiohttp.ClientSession')
    @async_test
    async def test_generate_image_from_text_api_error(self, MockClientSession):
        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 401
        http_response_mock.raise_for_status.side_effect = aiohttp.ClientResponseError(
            request_info=MagicMock(url="http://fake.url", method="POST", headers={}),
            history=(),
            status=401,
            message="Unauthorized"
        )

        request_context_mock = AsyncMock()
        request_context_mock.__aenter__.return_value = http_response_mock
        request_context_mock.__aexit__.return_value = None

        session_mock = AsyncMock()
        session_mock.request = MagicMock(return_value=request_context_mock) # Key change: MagicMock

        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None) # Explicitly AsyncMock

        client = RunwayMLClient(api_key="test_key")
        with self.assertRaises(aiohttp.ClientResponseError) as cm:
            await client.generate_image_from_text("A dog")

        self.assertEqual(cm.exception.status, 401)

    @patch('runway_client.aiohttp.ClientSession')
    @async_test
    async def test_generate_video_from_image_success(self, MockClientSession):
        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 200
        http_response_mock.json = AsyncMock(return_value={"id": "vid_task_789", "status": "QUEUED"})
        http_response_mock.raise_for_status = MagicMock()

        request_context_mock = AsyncMock()
        request_context_mock.__aenter__.return_value = http_response_mock
        request_context_mock.__aexit__.return_value = None

        session_mock = AsyncMock()
        session_mock.request = MagicMock(return_value=request_context_mock) # Key change: MagicMock

        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None) # Explicitly AsyncMock

        client = RunwayMLClient(api_key="test_key")
        image_url = "http://example.com/image.png"
        prompt_for_video = "Make it dance"
        options = {"seed": 42}

        response = await client.generate_video_from_image(image_url, prompt_for_video, options)

        session_mock.request.assert_called_once_with(
            "POST",
            f"{RUNWAYML_API_BASE_URL}/v1/tasks",
            headers=client.headers,
            json={
                "model": "gen4_turbo",
                "image_url": image_url,
                "prompt": prompt_for_video,
                "seed": 42
            }
        )
        self.assertEqual(response, {"id": "vid_task_789", "status": "QUEUED"})

    @patch('runway_client.aiohttp.ClientSession')
    @async_test
    async def test_generate_video_from_image_api_error(self, MockClientSession):
        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 500
        http_response_mock.raise_for_status.side_effect = aiohttp.ClientResponseError(
            request_info=MagicMock(url="http://fake.url", method="POST", headers={}),
            history=(),
            status=500,
            message="Server Error"
        )

        request_context_mock = AsyncMock()
        request_context_mock.__aenter__.return_value = http_response_mock
        request_context_mock.__aexit__.return_value = None

        session_mock = AsyncMock()
        session_mock.request = MagicMock(return_value=request_context_mock) # Key change: MagicMock

        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None) # Explicitly AsyncMock

        client = RunwayMLClient(api_key="test_key")
        with self.assertRaises(aiohttp.ClientResponseError) as cm:
            await client.generate_video_from_image("http://example.com/img.jpg", "Animate this")

        self.assertEqual(cm.exception.status, 500)

    @patch('runway_client.aiohttp.ClientSession')
    @async_test
    async def test_get_task_status_success(self, MockClientSession):
        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 200
        expected_status_response = {"id": "task_123", "status": "SUCCEEDED", "outputs": [{"url": "http://example.com/image.png"}]}
        http_response_mock.json = AsyncMock(return_value=expected_status_response)
        http_response_mock.raise_for_status = MagicMock()

        request_context_mock = AsyncMock()
        request_context_mock.__aenter__.return_value = http_response_mock
        request_context_mock.__aexit__.return_value = None

        session_mock = AsyncMock()
        session_mock.request = MagicMock(return_value=request_context_mock) # Key change: MagicMock

        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None) # Explicitly AsyncMock

        client = RunwayMLClient(api_key="test_key")
        task_id = "task_123"

        response = await client.get_task_status(task_id)

        session_mock.request.assert_called_once_with(
            "GET",
            f"{RUNWAYML_API_BASE_URL}/v1/tasks/{task_id}",
            headers=client.headers,
            json=None
        )
        self.assertEqual(response, expected_status_response)

    @patch('runway_client.aiohttp.ClientSession')
    @async_test
    async def test_get_task_status_api_error(self, MockClientSession):
        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 404
        http_response_mock.raise_for_status.side_effect = aiohttp.ClientResponseError(
            request_info=MagicMock(url="http://fake.url", method="GET", headers={}),
            history=(),
            status=404,
            message="Not Found"
        )

        request_context_mock = AsyncMock()
        request_context_mock.__aenter__.return_value = http_response_mock
        request_context_mock.__aexit__.return_value = None

        session_mock = AsyncMock()
        session_mock.request = MagicMock(return_value=request_context_mock) # Key change: MagicMock

        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None) # Explicitly AsyncMock

        client = RunwayMLClient(api_key="test_key")
        with self.assertRaises(aiohttp.ClientResponseError) as cm:
            await client.get_task_status("non_existent_task")

        self.assertEqual(cm.exception.status, 404)

    @patch('runway_client.aiohttp.ClientSession')
    @async_test
    async def test_request_connection_error(self, MockClientSession):
        session_mock = AsyncMock()
        session_mock.request = MagicMock(side_effect=aiohttp.ClientConnectionError("Connection failed")) # Key change

        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None) # Explicitly AsyncMock

        client = RunwayMLClient(api_key="test_key")
        with self.assertRaises(aiohttp.ClientConnectionError):
            await client.get_task_status("any_task")

        # Ensure the print statement was called within the _request method for ClientError
        # This part is tricky to assert directly without capturing stdout or further refactoring _request.
        # For now, we confirm the correct exception is raised.

if __name__ == '__main__':
    unittest.main()
