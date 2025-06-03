import aiohttp
import asyncio
import base64
from typing import Dict, Optional

# Assuming config.py is in the same directory or accessible in PYTHONPATH
from config import get_did_api_key, DID_API_BASE_URL

class DIDClient:
    """
    A client for interacting with the D-ID API for creating talking avatar videos.
    """

    def __init__(self, api_key: Optional[str] = None, api_host: str = DID_API_BASE_URL):
        """
        Initializes the DIDClient.

        Args:
            api_key: The D-ID API key. Defaults to fetching from environment.
                     The key should be in the format expected by D-ID for Basic Auth
                     (e.g., the raw key string, which will be appended with a colon and base64 encoded).
            api_host: The base URL for the D-ID API.
        """
        _api_key_val = api_key or get_did_api_key()

        # For D-ID Basic Auth, the API key is typically used as the username with an empty password,
        # and then "username:" is base64 encoded.
        # Example: "YOUR_API_KEY:"
        auth_string = f"{_api_key_val}:"
        encoded_auth_string = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')

        self.api_host = api_host
        self.headers = {
            "Authorization": f"Basic {encoded_auth_string}",
            "Content-Type": "application/json",
            "accept": "application/json"
        }

    async def _request(self, method: str, endpoint: str, payload: Optional[Dict] = None) -> Dict:
        """
        Makes an asynchronous HTTP request to the D-ID API.

        Args:
            method: HTTP method (e.g., "POST", "GET").
            endpoint: API endpoint (e.g., "/talks").
            payload: JSON payload for POST requests.

        Returns:
            The JSON response from the API as a dictionary.

        Raises:
            aiohttp.ClientResponseError: For HTTP errors.
        """
        url = f"{self.api_host}{endpoint}"
        async with aiohttp.ClientSession() as session:
            try:
                async with session.request(method, url, headers=self.headers, json=payload) as response:
                    response.raise_for_status()
                    return await response.json()
            except aiohttp.ClientResponseError as e:
                print(f"D-ID API request to {url} failed with status {e.status}: {e.message}")
                # Attempt to get more error details from response body if available
                try:
                    error_details = await e.response.json()
                    print(f"D-ID API Error details: {error_details}")
                except Exception: # If response is not JSON or other error
                    pass # error_details will not be available
                raise
            except aiohttp.ClientError as e: # Catch other client errors
                print(f"D-ID API request to {url} failed due to client error: {e}")
                raise

    async def create_talk(
        self,
        image_url: str,
        script_text: Optional[str] = None,
        script_audio_url: Optional[str] = None,
        provider_config: Optional[Dict] = None,
        talk_config: Optional[Dict] = None
    ) -> Dict:
        """
        Creates a new talk (talking avatar video).
        https://docs.d-id.com/reference/createtalk

        Args:
            image_url: URL of the source image for the avatar.
            script_text: Text to be spoken by the avatar.
            script_audio_url: URL of an audio file to be used for the script.
            provider_config: Configuration for the TTS provider (if script_text is used).
                             Example: {'type': 'microsoft', 'voice_id': 'en-US-JennyNeural'}
            talk_config: Additional configuration for the talk (e.g., result_format).

        Returns:
            The initial task creation response from D-ID (likely containing an 'id').
        """
        if not script_text and not script_audio_url:
            raise ValueError("Either script_text or script_audio_url must be provided.")
        if script_text and script_audio_url:
            raise ValueError("Provide either script_text or script_audio_url, not both.")

        payload: Dict[str, Any] = {"source_url": image_url} # Any must be imported from typing

        if script_text:
            script_payload = {"type": "text", "input": script_text}
            if provider_config:
                script_payload["provider"] = provider_config
            else: # Default provider if none specified
                 script_payload["provider"] = {'type': 'microsoft', 'voice_id': 'en-US-JennyNeural'}
            payload["script"] = script_payload
        elif script_audio_url:
            payload["script"] = {"type": "audio", "audio_url": script_audio_url}

        if talk_config:
            payload.update(talk_config) # Add other configurations like 'face', 'config' (for result_format etc.)
            # D-ID's API structure for `config` within the talk payload:
            # "config": { "result_format": "mp4", "stitch": True/False }
            # "face": { "padding": [0,0,0,0], "detector": "mediapipe", "landmarks":True/False}
            # These would be passed inside talk_config if needed.

        return await self._request("POST", "/talks", payload)

    async def get_talk_status(self, talk_id: str) -> Dict:
        """
        Retrieves the status of a specific talk.
        https://docs.d-id.com/reference/gettalk

        Args:
            talk_id: The ID of the talk to check.

        Returns:
            The talk status response (JSON), which may include 'status',
            'result_url' (if completed), 'error' (if failed).
        """
        return await self._request("GET", f"/talks/{talk_id}")


# Example usage (for testing purposes)
async def main():
    print("Attempting to initialize DIDClient...")
    # This will raise an error if DID_API_KEY is not set.
    # For this subtask, we are not making actual calls.
    # To run this example locally: export DID_API_KEY="YOUR_D-ID_API_KEY" (e.g. "username:password" or just the key part)
    try:
        # Provide a dummy key for local testing if env var is not set
        client = DIDClient(api_key="dummy_did_key_for_testing_structure")
        print("DIDClient initialized.")

        # Example of how one might call create_talk (will fail without live API and valid key)
        # print("\nAttempting to simulate create_talk (will fail without live API):")
        # try:
        #     provider_conf = {'type': 'microsoft', 'voice_id': 'en-US-JennyNeural'}
        #     talk_conf = {"config": {"result_format": "mp4"}} # D-ID specific config structure
        #     talk_response = await client.create_talk(
        #         image_url="https://example.com/avatar.png",
        #         script_text="Hello, this is a test of the D-ID API client.",
        #         provider_config=provider_conf,
        #         talk_config=talk_conf
        #     )
        #     print(f"Talk creation response (simulated): {talk_response}")
        #     if talk_response and 'id' in talk_response:
        #         task_id = talk_response['id']
        #         print(f"\nAttempting to simulate get_talk_status for task {task_id} (will fail):")
        #         status = await client.get_talk_status(task_id)
        #         print(f"Talk status (simulated): {status}")
        # except aiohttp.ClientError as e:
        #     print(f"Caught expected client error during simulation: {e}")
        # except ValueError as e:
        #      print(f"Configuration or value error: {e}")

    except ValueError as e: # From get_did_api_key() if key is not provided and not in env
        print(f"Error initializing client: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    # To run this main function for basic structural check:
    # 1. Make sure aiohttp is installed: pip install aiohttp
    # 2. You can set a dummy API key: export DID_API_KEY="YOUR_KEY_HERE"
    # asyncio.run(main())
    print("DIDClient structure defined. Example main() function can be un-commented for testing (requires aiohttp).")
