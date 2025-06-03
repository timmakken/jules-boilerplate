import asyncio
from typing import Dict, Optional, Union # Union for str | None type hint

from runway_client import RunwayMLClient
from config import get_runway_api_key # For context, client uses this

class VideoStyleTransferService:
    """
    Service to manage video style transfer using RunwayML.
    Assumes the RunwayML API's image-to-video capabilities can be leveraged
    by providing a style reference image.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initializes the VideoStyleTransferService.

        Args:
            api_key: The RunwayML API key. If None, it will be fetched from
                     the environment variable RUNWAYML_API_KEY by the client.
        """
        self.client = RunwayMLClient(api_key=api_key)
        # Conceptual key for passing style image in options to the client
        self.style_image_param_name = "style_reference_image_url"

    async def submit_style_transfer_job(
        self,
        input_image_url: str,
        style_image_url: str,
        user_id: str, # For logging/tracking
        prompt: Optional[str] = None,
        video_options: Optional[Dict] = None
    ) -> str:
        """
        Submits a task to generate a stylized video based on an input image and a style image.

        Args:
            input_image_url: URL of the primary input image (content).
            style_image_url: URL of the image to be used as style reference.
            user_id: Identifier for the user requesting the video.
            prompt: Optional text prompt to guide video content or action.
            video_options: Additional options for video generation (e.g., model, seed).
                           The style image URL will be added to these options.

        Returns:
            The task ID for the video generation task.

        Raises:
            Exception: If the task submission fails or does not return a task ID.
        """
        print(f"User '{user_id}' submitted style transfer job:")
        print(f"  Input Image URL: {input_image_url}")
        print(f"  Style Image URL: {style_image_url}")
        if prompt:
            print(f"  Prompt: '{prompt}'")

        # Prepare options for the client, ensuring the style image is included.
        effective_options = video_options.copy() if video_options else {}
        effective_options[self.style_image_param_name] = style_image_url

        # If a specific model for style transfer is known, it could be set here or expected in video_options.
        # For now, we rely on the client's default or a model specified in video_options.
        # Example: effective_options.setdefault("model", "gen4_style_transfer_model_name")

        if video_options: # Log original video_options if any, before modification
            print(f"  Original Video Options: {video_options}")
        print(f"  Effective Video Options sent to client: {effective_options}")


        try:
            # Using the existing generate_video_from_image client method.
            # The `input_image_url` serves as the primary image input.
            # The `style_image_url` is passed via `effective_options`.
            task_response = await self.client.generate_video_from_image(
                image_url=input_image_url,
                prompt_for_video=prompt,
                options=effective_options
            )

            task_id = task_response.get("id")
            if not task_id:
                print(f"Error: Style transfer task submission response missing 'id'. Response: {task_response}")
                raise Exception("Style transfer task submission did not return a task ID.")

            print(f"Style transfer video generation task submitted successfully for user '{user_id}'. Task ID: {task_id}")
            # In a real application, this task_id would be stored.
            return task_id
        except Exception as e:
            print(f"Error submitting style transfer job for user '{user_id}': {e}")
            raise

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
        print(f"Checking status for video style transfer job ID: {job_id}")
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
        max_attempts: int = 70 # Slightly longer default for potentially complex style transfer
    ) -> Union[str, None]:
        """
        Polls for the video generation task status and returns the video URL if successful.
        (This implementation is very similar to ImageToVideoService.get_completed_video_url)

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
        print(f"Polling for completion of style transfer video job ID: {job_id}...")
        for attempt in range(max_attempts):
            print(f"Attempt {attempt + 1}/{max_attempts} for job {job_id}...")
            try:
                task_status_response = await self.check_video_status(job_id)
                status = task_status_response.get("status")

                if status == "SUCCEEDED":
                    print(f"Style transfer video job {job_id} SUCCEEDED.")
                    try:
                        if 'outputs' in task_status_response and task_status_response['outputs']:
                            output = task_status_response['outputs'][0]
                        elif 'output' in task_status_response and task_status_response['output']:
                            output = task_status_response['output'][0] if isinstance(task_status_response['output'], list) else task_status_response['output']
                        else:
                            raise KeyError("Neither 'outputs' nor 'output' key found in completed task response.")

                        video_url = output.get("url") or output.get("uri")
                        if not video_url:
                            print(f"Error: Job {job_id} SUCCEEDED but no URL/URI found. Output: {output}")
                            raise ValueError("Video URL/URI not found in task output.")

                        print(f"Video URL for job {job_id}: {video_url}")
                        return video_url
                    except (KeyError, IndexError, TypeError, ValueError) as e:
                        print(f"Error extracting video URL for job {job_id}: {e}. Full response: {task_status_response}")
                        raise Exception(f"Failed to extract video URL from successful task {job_id}: {e}")

                elif status == "FAILED":
                    error_message = task_status_response.get("error_message", "Task failed without a specific error message.")
                    print(f"Style transfer video job {job_id} FAILED: {error_message}")
                    raise Exception(f"Style transfer video generation task {job_id} failed: {error_message}")

                elif status in ["PENDING", "RUNNING"]:
                    print(f"Job {job_id} status: {status}. Waiting {poll_interval_seconds}s...")
                    await asyncio.sleep(poll_interval_seconds)

                else:
                    print(f"Job {job_id} returned an unknown status: {status}. Response: {task_status_response}")
                    raise Exception(f"Task {job_id} returned an unknown status: {status}")

            except Exception as e:
                print(f"Error during polling attempt {attempt + 1} for job {job_id}: {e}")
                if attempt == max_attempts - 1:
                    raise
                await asyncio.sleep(poll_interval_seconds)

        print(f"Style transfer video job {job_id} timed out after {max_attempts} attempts.")
        raise TimeoutError(f"Polling for style transfer video job {job_id} timed out.")

# Example Usage (Illustrative)
async def main():
    try:
        print("Initializing VideoStyleTransferService (example)...")
        service = VideoStyleTransferService(api_key="dummy_style_transfer_key")
        print("VideoStyleTransferService initialized.")

        input_url = "http://example.com/input.png"
        style_url = "http://example.com/style_ref.jpg"
        user = "style_user_789"
        custom_prompt = "A vibrant, painterly animation"

        print(f"\nSimulating style transfer submission for input: {input_url}, style: {style_url}")
        # task_id = await service.submit_style_transfer_job(
        #     input_image_url=input_url,
        #     style_image_url=style_url,
        #     user_id=user,
        #     prompt=custom_prompt,
        #     video_options={"model": "gen4_turbo_style", "duration_seconds": 8}
        # )
        # print(f"Style transfer task ID (simulated): {task_id}")

        # if task_id:
        #     print(f"\nSimulating polling for video URL for job ID: {task_id}")
        #     video_url = await service.get_completed_video_url(task_id, poll_interval_seconds=1, max_attempts=3)
        #     if video_url:
        #         print(f"Retrieved stylized video URL (simulated): {video_url}")
        #     else:
        #         print("Stylized video URL could not be retrieved (simulated).")
        print("\nVideoStyleTransferService example main() finished.")
        print("Actual calls require a live API or mocked client, and a valid API key.")

    except ValueError as ve:
        print(f"Configuration Error: {ve}")
    except Exception as e:
        print(f"An error occurred in the example: {e}")

if __name__ == "__main__":
    # asyncio.run(main())
    print("VideoStyleTransferService structure defined. Example main() can be un-commented for testing.")
