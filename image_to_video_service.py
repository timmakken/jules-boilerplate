import asyncio
from typing import Dict, Optional, Union # Union for str | None type hint

from runway_client import RunwayMLClient
# config is used by RunwayMLClient, not directly here, but good for context
from config import get_runway_api_key

class ImageToVideoService:
    """
    Service to manage the image-to-video generation process using RunwayML.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initializes the ImageToVideoService.

        Args:
            api_key: The RunwayML API key. If None, it will be fetched from
                     the environment variable RUNWAYML_API_KEY by the client.
        """
        self.client = RunwayMLClient(api_key=api_key)

    async def submit_image_for_video_generation(
        self,
        image_url: str,
        user_id: str, # For logging/tracking purposes
        prompt_for_video: Optional[str] = None,
        video_options: Optional[Dict] = None
    ) -> str:
        """
        Submits a task to generate a video from a given image URL and optional prompt.

        Args:
            image_url: The URL of the image to use for video generation.
            user_id: Identifier for the user requesting the video.
            prompt_for_video: Optional text prompt to guide video generation.
            video_options: Additional options for video generation (e.g., model, seed, cfg_weight).
                           If `model` is included in `video_options`, it will override the
                           default "gen4_turbo" in the client's `generate_video_from_image`.

        Returns:
            The task ID for the video generation task.

        Raises:
            Exception: If the task submission fails or does not return a task ID.
        """
        print(f"User '{user_id}' submitted image URL '{image_url}' for video generation.")
        if prompt_for_video:
            print(f"With prompt: '{prompt_for_video}'")
        if video_options:
            print(f"With video options: {video_options}")

        try:
            task_response = await self.client.generate_video_from_image(
                image_url=image_url,
                prompt_for_video=prompt_for_video,
                options=video_options
            )

            task_id = task_response.get("id")
            if not task_id:
                # Log the full response for debugging if ID is missing
                print(f"Error: Task submission response missing 'id'. Response: {task_response}")
                raise Exception("Video generation task submission did not return a task ID.")

            print(f"Video generation task submitted successfully for user '{user_id}'. Task ID: {task_id}")
            # In a real application, this task_id would be stored (e.g., in I2V_JOB_STORE)
            # associated with user_id, image_url, etc.
            return task_id
        except Exception as e:
            print(f"Error submitting image for video generation for user '{user_id}': {e}")
            raise # Re-raise the exception to be handled by the caller

    async def check_video_status(self, job_id: str) -> Dict:
        """
        Checks the status of a video generation job.

        Args:
            job_id: The task ID of the video generation job.

        Returns:
            The status response from the RunwayML API.

        Raises:
            Exception: If the status check fails.
        """
        print(f"Checking status for video job ID: {job_id}")
        try:
            status_response = await self.client.get_task_status(job_id)
            print(f"Status for job {job_id}: {status_response.get('status', 'Unknown')}")
            return status_response
        except Exception as e:
            print(f"Error checking status for job ID '{job_id}': {e}")
            raise

    async def get_completed_video_url(
        self,
        job_id: str,
        poll_interval_seconds: int = 5,
        max_attempts: int = 60 # e.g., 60 attempts * 5s = 5 minutes timeout
    ) -> Union[str, None]: # Python 3.9+ use str | None
        """
        Polls for the video generation task status and returns the video URL if successful.

        Args:
            job_id: The ID of the video generation task.
            poll_interval_seconds: How often to poll for status.
            max_attempts: Maximum number of polling attempts before timing out.

        Returns:
            The URL of the generated video if successful, otherwise None.

        Raises:
            TimeoutError: If the task does not complete (SUCCEEDED or FAILED) within max_attempts.
            Exception: For other errors during polling or if the task failed.
        """
        print(f"Polling for completion of video job ID: {job_id}...")
        for attempt in range(max_attempts):
            print(f"Attempt {attempt + 1}/{max_attempts} for job {job_id}...")
            try:
                task_status_response = await self.check_video_status(job_id)
                status = task_status_response.get("status")

                if status == "SUCCEEDED":
                    print(f"Video job {job_id} SUCCEEDED.")
                    # Assume output structure: task_response['outputs'][0]['url']
                    # Based on Python SDK examples and common API patterns.
                    try:
                        if 'outputs' in task_status_response and task_status_response['outputs']:
                            output = task_status_response['outputs'][0]
                        elif 'output' in task_status_response and task_status_response['output']:
                            output = task_status_response['output'][0] if isinstance(task_status_response['output'], list) else task_status_response['output']
                        else:
                            raise KeyError("Neither 'outputs' nor 'output' key found in completed task response.")

                        video_url = output.get("url") or output.get("uri")
                        if not video_url:
                            print(f"Error: Video job {job_id} SUCCEEDED but no URL/URI found in output. Output: {output}")
                            raise ValueError("Video URL/URI not found in task output.")

                        print(f"Video URL for job {job_id}: {video_url}")
                        return video_url
                    except (KeyError, IndexError, TypeError, ValueError) as e:
                        print(f"Error extracting video URL for job {job_id}: {e}. Full response: {task_status_response}")
                        raise Exception(f"Failed to extract video URL from successful task {job_id}: {e}")

                elif status == "FAILED":
                    error_message = task_status_response.get("error_message", "Task failed without a specific error message.")
                    print(f"Video job {job_id} FAILED: {error_message}")
                    raise Exception(f"Video generation task {job_id} failed: {error_message}")

                elif status in ["PENDING", "RUNNING"]: # Add other potential in-progress statuses if known
                    print(f"Video job {job_id} status: {status}. Waiting {poll_interval_seconds}s...")
                    await asyncio.sleep(poll_interval_seconds)

                else: # Unknown or unexpected status
                    print(f"Video job {job_id} returned an unknown status: {status}. Response: {task_status_response}")
                    # Depending on desired behavior, could retry or raise immediately.
                    # For now, let's treat unknown as a failure for polling.
                    raise Exception(f"Task {job_id} returned an unknown status: {status}")

            except Exception as e:
                # If check_video_status itself fails or an extraction error occurs for SUCCEEDED tasks
                print(f"Error during polling attempt {attempt + 1} for job {job_id}: {e}")
                # If it's a failure status from the task, it would have been raised already.
                # This handles client errors or unexpected issues.
                if attempt == max_attempts - 1: # If it's the last attempt, re-raise
                    raise
                await asyncio.sleep(poll_interval_seconds) # Wait before retrying unless it's the last attempt

        print(f"Video job {job_id} timed out after {max_attempts} attempts.")
        raise TimeoutError(f"Polling for video job {job_id} timed out.")

# Example Usage (Illustrative)
async def main():
    # This requires RUNWAYML_API_KEY to be set in the environment or passed to constructor.
    # As this is illustrative and actual API calls are not part of this subtask's execution,
    # we'll focus on the structural call flow.
    try:
        print("Initializing ImageToVideoService (example)...")
        # Pass a dummy key if you don't want it to check env var during this example run
        service = ImageToVideoService(api_key="dummy_i2v_key_for_example")
        print("ImageToVideoService initialized.")

        sample_image_url = "http://example.com/my_image.png"
        user_id = "example_user_123"
        prompt = "A beautiful animation of this image"

        # Simulate submitting a job
        print(f"\nSimulating submission for image: {sample_image_url} by user: {user_id}")
        # video_task_id = await service.submit_image_for_video_generation(
        #     image_url=sample_image_url,
        #     user_id=user_id,
        #     prompt_for_video=prompt,
        #     video_options={"model": "gen3a_turbo", "seed": 123} # Example options
        # )
        # print(f"Video generation task ID (simulated): {video_task_id}")

        # if video_task_id:
        #     print(f"\nSimulating polling for video URL for job ID: {video_task_id}")
            # In a real scenario, the client would need to be mocked for this to run without errors.
            # video_url = await service.get_completed_video_url(video_task_id, poll_interval_seconds=1, max_attempts=5)
            # if video_url:
            #     print(f"Retrieved video URL (simulated): {video_url}")
            # else:
            #     print("Video URL could not be retrieved (simulated).")
        print("\nImageToVideoService example main() finished.")
        print("Actual calls require a running RunwayML API or mocked client, and valid API key.")

    except ValueError as ve: # E.g. API key not found by client
        print(f"Configuration Error: {ve}")
    except Exception as e:
        print(f"An error occurred in the example: {e}")

if __name__ == "__main__":
    # To run this main function for basic structural check:
    # 1. Ensure runway_client.py and config.py are accessible.
    # 2. aiohttp must be installed (pip install aiohttp).
    # 3. You can set a dummy API key: export RUNWAYML_API_KEY="YOUR_DUMMY_KEY" or pass it.
    # asyncio.run(main())
    print("ImageToVideoService structure defined. Example main() can be un-commented for testing (requires aiohttp and asyncio).")
