import asyncio
from typing import Dict, Optional, Union # For str | None

from did_client import DIDClient # Assuming did_client.py is in the same path
# config is used by DIDClient, not directly here
from config import get_did_api_key

class AvatarService:
    """
    Service for managing avatar video generation using the D-ID API.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initializes the AvatarService.

        Args:
            api_key: The D-ID API key. If None, the DIDClient will attempt
                     to fetch it from the environment variable DID_API_KEY.
        """
        self.client = DIDClient(api_key=api_key)

    async def submit_avatar_talk_job(
        self,
        image_url: str,
        text_to_speak: str,
        user_id: str, # For logging/tracking
        voice_id: str = "en-US-JennyNeural", # Default voice
        provider_type: str = "microsoft",   # Default TTS provider
        avatar_options: Optional[Dict] = None # For additional D-ID talk_config options
    ) -> str:
        """
        Submits a job to D-ID to create a talking avatar video.

        Args:
            image_url: URL of the avatar image.
            text_to_speak: The script text for the avatar to speak.
            user_id: Identifier for the user requesting the avatar video.
            voice_id: The voice ID for the TTS provider.
            provider_type: The type of TTS provider (e.g., 'microsoft', 'amazon').
            avatar_options: Optional dictionary for additional D-ID talk configurations
                            (e.g., result_format, expressions). This corresponds to
                            the 'talk_config' in DIDClient.create_talk.

        Returns:
            The task ID (talk ID) from D-ID.

        Raises:
            Exception: If the job submission fails or D-ID does not return a task ID.
        """
        print(f"User '{user_id}' submitted avatar talk job:")
        print(f"  Image URL: {image_url}")
        print(f"  Text to speak: \"{text_to_speak[:50]}...\"") # Log snippet
        print(f"  Voice ID: {voice_id}, Provider: {provider_type}")

        provider_config = {'type': provider_type, 'voice_id': voice_id}

        if avatar_options:
            print(f"  Additional Avatar Options: {avatar_options}")

        try:
            talk_response = await self.client.create_talk(
                image_url=image_url,
                script_text=text_to_speak,
                provider_config=provider_config,
                talk_config=avatar_options # Pass avatar_options as talk_config
            )

            task_id = talk_response.get("id")
            if not task_id:
                print(f"Error: Avatar talk job submission response missing 'id'. Response: {talk_response}")
                raise Exception("Avatar talk job submission did not return a task ID.")

            print(f"Avatar talk job submitted successfully for user '{user_id}'. Task ID: {task_id}")
            # In a real application, task_id would be stored for the user.
            return task_id
        except Exception as e:
            print(f"Error submitting avatar talk job for user '{user_id}': {e}")
            raise # Re-raise to be handled by the caller

    async def check_avatar_video_status(self, job_id: str) -> Dict:
        """
        Checks the status of an avatar video generation job.

        Args:
            job_id: The task ID (talk ID) of the avatar video job.

        Returns:
            The status response from the D-ID API.

        Raises:
            Exception: If the status check fails.
        """
        print(f"Checking status for avatar video job ID: {job_id}")
        try:
            status_response = await self.client.get_talk_status(job_id)
            print(f"Status for job {job_id}: {status_response.get('status', 'Unknown')}")
            return status_response
        except Exception as e:
            print(f"Error checking status for avatar job ID '{job_id}': {e}")
            raise

    async def get_completed_avatar_video_url(
        self,
        job_id: str,
        poll_interval_seconds: int = 3, # D-ID talks are often quick
        max_attempts: int = 40  # e.g., 40 attempts * 3s = 120s = 2 minutes timeout
    ) -> Union[str, None]:
        """
        Polls for the avatar video generation status and returns the video URL if successful.
        D-ID success status is typically 'done'. Error status can be 'error' or 'rejected'.

        Args:
            job_id: The ID of the avatar video generation task (talk ID).
            poll_interval_seconds: How often to poll for status.
            max_attempts: Maximum number of polling attempts before timing out.

        Returns:
            The URL of the generated avatar video if successful, otherwise None.

        Raises:
            TimeoutError: If the task does not complete within max_attempts.
            Exception: For other errors during polling or if the task failed.
        """
        print(f"Polling for completion of avatar video job ID: {job_id}...")
        for attempt in range(max_attempts):
            print(f"Attempt {attempt + 1}/{max_attempts} for avatar job {job_id}...")
            try:
                task_status_response = await self.check_avatar_video_status(job_id)
                status = task_status_response.get("status")

                # D-ID specific terminal statuses
                if status == "done": # D-ID uses 'done' for successful completion
                    print(f"Avatar video job {job_id} SUCCEEDED (status: 'done').")
                    video_url = task_status_response.get("result_url")
                    if not video_url:
                        print(f"Error: Job {job_id} 'done' but no 'result_url' found. Response: {task_status_response}")
                        raise ValueError("'result_url' not found in successful task output.")

                    print(f"Avatar video URL for job {job_id}: {video_url}")
                    return video_url

                elif status in ["error", "rejected"]: # D-ID uses 'error' or 'rejected' for failures
                    error_details = task_status_response.get("error") or task_status_response.get("result") # D-ID might put error in 'result' for some rejections
                    if isinstance(error_details, dict): # if error is an object
                        error_message = error_details.get("description", str(error_details))
                    else: # if error_details is a string or None
                        error_message = error_details or "Task failed or was rejected without a specific error message."

                    print(f"Avatar video job {job_id} FAILED (status: {status}). Error: {error_message}")
                    raise Exception(f"Avatar video generation task {job_id} failed (status: {status}): {error_message}")

                elif status in ["created", "started", "pending"]: # In-progress statuses
                    print(f"Avatar job {job_id} status: {status}. Waiting {poll_interval_seconds}s...")
                    await asyncio.sleep(poll_interval_seconds)

                else: # Unknown or unexpected status
                    print(f"Avatar job {job_id} returned an unknown status: {status}. Response: {task_status_response}")
                    raise Exception(f"Task {job_id} returned an unknown status: {status}")

            except Exception as e:
                print(f"Error during polling attempt {attempt + 1} for avatar job {job_id}: {e}")
                if attempt == max_attempts - 1: # If it's the last attempt, re-raise the caught exception
                    raise
                await asyncio.sleep(poll_interval_seconds) # Wait before retrying

        print(f"Avatar video job {job_id} timed out after {max_attempts} attempts.")
        raise TimeoutError(f"Polling for avatar video job {job_id} timed out.")


# Example Usage (Illustrative)
async def main():
    try:
        print("Initializing AvatarService (example)...")
        # Ensure DID_API_KEY is set in your environment or pass it directly
        service = AvatarService(api_key="dummy_did_api_key_for_example")
        print("AvatarService initialized.")

        image_url = "https://example.com/path/to/your/avatar_image.png"
        text = "Hello world! This is your friendly AI avatar speaking."
        user = "avatar_user_001"

        print(f"\nSimulating avatar talk job submission for image: {image_url}")
        # task_id = await service.submit_avatar_talk_job(
        #     image_url=image_url,
        #     text_to_speak=text,
        #     user_id=user,
        #     # Example: Use a specific voice and pass result_format
        #     voice_id="en-US-AriaNeural",
        #     avatar_options={"config": {"result_format": "mp4", "stitch": True}}
        # )
        # print(f"Avatar talk job ID (simulated): {task_id}")

        # if task_id:
        #     print(f"\nSimulating polling for avatar video URL for job ID: {task_id}")
        #     video_url = await service.get_completed_avatar_video_url(
        #         task_id,
        #         poll_interval_seconds=1,
        #         max_attempts=5
        #     )
        #     if video_url:
        #         print(f"Retrieved avatar video URL (simulated): {video_url}")
        #     else:
        #         print("Avatar video URL could not be retrieved (simulated).")
        print("\nAvatarService example main() finished.")
        print("Actual calls require a live D-ID API or mocked client, and a valid API key.")

    except ValueError as ve: # E.g. API key not found by client
        print(f"Configuration Error: {ve}")
    except Exception as e:
        print(f"An error occurred in the example: {e}")

if __name__ == "__main__":
    # To run this main function for basic structural check:
    # 1. Ensure did_client.py and config.py are accessible.
    # 2. aiohttp must be installed (pip install aiohttp).
    # 3. Set a dummy API key: export DID_API_KEY="YOUR_D-ID_KEY_HERE" or pass it.
    # asyncio.run(main())
    print("AvatarService structure defined. Example main() can be un-commented for testing (requires aiohttp and asyncio).")
