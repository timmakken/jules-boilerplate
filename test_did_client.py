import asyncio
import unittest
from unittest.mock import patch, AsyncMock, MagicMock
import aiohttp
import base64

# Ensure did_client and config are importable
from did_client import DIDClient, DID_API_BASE_URL
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

class TestDIDClient(unittest.TestCase):

    @patch('did_client.get_did_api_key', return_value="test_did_api_key")
    def test_init_with_key_from_env(self, mock_get_key):
        """Test DIDClient initialization with API key from environment."""
        client = DIDClient()
        self.assertEqual(client.api_host, DID_API_BASE_URL)

        expected_auth_val = base64.b64encode(b"test_did_api_key:").decode('utf-8')
        self.assertEqual(client.headers["Authorization"], f"Basic {expected_auth_val}")
        self.assertEqual(client.headers["Content-Type"], "application/json")
        self.assertEqual(client.headers["accept"], "application/json")
        mock_get_key.assert_called_once()

    def test_init_with_provided_key(self):
        """Test DIDClient initialization with a directly provided API key."""
        custom_key = "my_direct_did_key"
        custom_host = "https://custom.did.host"
        client = DIDClient(api_key=custom_key, api_host=custom_host)

        self.assertEqual(client.api_host, custom_host)
        expected_auth_val = base64.b64encode(f"{custom_key}:".encode('utf-8')).decode('utf-8')
        self.assertEqual(client.headers["Authorization"], f"Basic {expected_auth_val}")

    @patch('did_client.aiohttp.ClientSession')
    @async_test
    async def test_create_talk_text_script_success(self, MockClientSession):
        """Test successful talk creation with a text script."""
        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 201 # D-ID typically returns 201 for created talks
        mock_response_content = {"id": "tlk_123", "status": "created"}
        http_response_mock.json = AsyncMock(return_value=mock_response_content)
        http_response_mock.raise_for_status = MagicMock()

        request_cm_mock = AsyncMock() # The async context manager
        request_cm_mock.__aenter__.return_value = http_response_mock
        request_cm_mock.__aexit__ = AsyncMock(return_value=None)

        session_mock = AsyncMock() # The session object
        session_mock.request = MagicMock(return_value=request_cm_mock) # request() returns the CM

        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None)

        client = DIDClient(api_key="test_key")
        image_url = "http://example.com/avatar.png"
        script_text = "Hello D-ID world"
        provider_config = {'type': 'microsoft', 'voice_id': 'en-US-AriaNeural'}
        talk_config = {"config": {"result_format": "mp4"}}

        response = await client.create_talk(
            image_url=image_url,
            script_text=script_text,
            provider_config=provider_config,
            talk_config=talk_config
        )

        expected_payload = {
            "source_url": image_url,
            "script": {
                "type": "text",
                "input": script_text,
                "provider": provider_config
            },
            "config": {"result_format": "mp4"} # talk_config directly merged
        }
        session_mock.request.assert_called_once_with(
            "POST",
            f"{DID_API_BASE_URL}/talks",
            headers=client.headers,
            json=expected_payload
        )
        self.assertEqual(response, mock_response_content)

    @patch('did_client.aiohttp.ClientSession')
    @async_test
    async def test_create_talk_audio_script_success(self, MockClientSession):
        """Test successful talk creation with an audio script URL."""
        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 201
        mock_response_content = {"id": "tlk_456", "status": "created"}
        http_response_mock.json = AsyncMock(return_value=mock_response_content)
        http_response_mock.raise_for_status = MagicMock()

        request_cm_mock = AsyncMock()
        request_cm_mock.__aenter__.return_value = http_response_mock
        request_cm_mock.__aexit__ = AsyncMock(return_value=None)
        session_mock = AsyncMock()
        session_mock.request = MagicMock(return_value=request_cm_mock)
        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None)

        client = DIDClient(api_key="test_key")
        image_url = "http://example.com/avatar2.png"
        script_audio_url = "http://example.com/myaudio.wav"

        response = await client.create_talk(
            image_url=image_url,
            script_audio_url=script_audio_url
        )
        expected_payload = {
            "source_url": image_url,
            "script": {
                "type": "audio",
                "audio_url": script_audio_url
            }
        }
        session_mock.request.assert_called_once_with(
            "POST", f"{DID_API_BASE_URL}/talks", headers=client.headers, json=expected_payload
        )
        self.assertEqual(response, mock_response_content)

    @patch('did_client.aiohttp.ClientSession')
    @async_test
    async def test_create_talk_api_error(self, MockClientSession):
        """Test API error during talk creation."""
        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 401 # Unauthorized
        # Mock the response object for ClientResponseError
        error_response_obj = MagicMock(spec=aiohttp.ClientResponse) # aiohttp.ClientResponse, not ClientResponseError
        error_response_obj.status = 401
        error_response_obj.json = AsyncMock(return_value={"description": "Unauthorized access"}) # D-ID error structure

        http_response_mock.raise_for_status.side_effect = aiohttp.ClientResponseError(
            request_info=MagicMock(url=f"{DID_API_BASE_URL}/talks", method="POST", headers={}),
            history=(),
            status=401,
            message="Unauthorized"
            # response argument removed
        )
        # Ensure the http_response_mock (which becomes e.response) can provide json details
        http_response_mock.json = AsyncMock(return_value={"description": "Unauthorized access"})


        request_cm_mock = AsyncMock()
        request_cm_mock.__aenter__.return_value = http_response_mock # This is the failing response mock
        request_cm_mock.__aexit__ = AsyncMock(return_value=None)
        session_mock = AsyncMock()
        session_mock.request = MagicMock(return_value=request_cm_mock)
        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None)

        client = DIDClient(api_key="invalid_key")
        with self.assertRaises(aiohttp.ClientResponseError) as cm:
            await client.create_talk(image_url="img.png", script_text="hello")

        self.assertEqual(cm.exception.status, 401)

    @patch('did_client.aiohttp.ClientSession')
    @async_test
    async def test_get_talk_status_success(self, MockClientSession):
        """Test successfully getting talk status."""
        talk_id = "tlk_123"
        expected_url = f"{DID_API_BASE_URL}/talks/{talk_id}"
        mock_response_content = {"id": talk_id, "status": "done", "result_url": "http://example.com/video.mp4"}

        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 200
        http_response_mock.json = AsyncMock(return_value=mock_response_content)
        http_response_mock.raise_for_status = MagicMock()

        request_cm_mock = AsyncMock()
        request_cm_mock.__aenter__.return_value = http_response_mock
        request_cm_mock.__aexit__ = AsyncMock(return_value=None)
        session_mock = AsyncMock()
        session_mock.request = MagicMock(return_value=request_cm_mock)
        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None)

        client = DIDClient(api_key="test_key")
        response = await client.get_talk_status(talk_id)

        session_mock.request.assert_called_once_with(
            "GET", expected_url, headers=client.headers, json=None
        )
        self.assertEqual(response, mock_response_content)

    @patch('did_client.aiohttp.ClientSession')
    @async_test
    async def test_get_talk_status_api_error(self, MockClientSession):
        """Test API error when getting talk status."""
        talk_id = "tlk_error"
        http_response_mock = AsyncMock(spec=aiohttp.ClientResponse)
        http_response_mock.status = 404 # Not Found
        error_response_obj = MagicMock(spec=aiohttp.ClientResponse)
        error_response_obj.status = 404
        error_response_obj.json = AsyncMock(return_value={"description": "Talk not found"})

        http_response_mock.raise_for_status.side_effect = aiohttp.ClientResponseError(
            request_info=MagicMock(url=f"{DID_API_BASE_URL}/talks/{talk_id}", method="GET", headers={}),
            history=(), status=404, message="Not Found"
            # response argument removed
        )
        # Ensure the http_response_mock (which becomes e.response) can provide json details
        http_response_mock.json = AsyncMock(return_value={"description": "Talk not found"})

        request_cm_mock = AsyncMock()
        request_cm_mock.__aenter__.return_value = http_response_mock
        request_cm_mock.__aexit__ = AsyncMock(return_value=None)
        session_mock = AsyncMock()
        session_mock.request = MagicMock(return_value=request_cm_mock)
        MockClientSession.return_value.__aenter__.return_value = session_mock
        MockClientSession.return_value.__aexit__ = AsyncMock(return_value=None)

        client = DIDClient(api_key="test_key")
        with self.assertRaises(aiohttp.ClientResponseError) as cm:
            await client.get_talk_status(talk_id)
        self.assertEqual(cm.exception.status, 404)

    def test_create_talk_validation_errors(self):
        """Test validation errors in create_talk before API call."""
        client = DIDClient(api_key="test_key")
        with self.assertRaisesRegex(ValueError, "Either script_text or script_audio_url must be provided."):
            asyncio.run(client.create_talk(image_url="img.png")) # Using asyncio.run for async method in sync test

        with self.assertRaisesRegex(ValueError, "Provide either script_text or script_audio_url, not both."):
            asyncio.run(client.create_talk(image_url="img.png", script_text="hi", script_audio_url="audio.wav"))


if __name__ == '__main__':
    unittest.main()
