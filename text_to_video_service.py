import asyncio
import time
from typing import Dict, Optional

# Assuming runway_client.py and config.py are in the same directory or accessible in PYTHONPATH
from runway_client import RunwayMLClient
# get_runway_api_key is not directly used here but client init needs it
from config import get_runway_api_key

class TextToVideoService:
    """
    Service to manage the text-to-video generation process using RunwayML.
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initializes the TextToVideoService.

        Args:
            api_key: The RunwayML API key. If None, it will be fetched from
                     the environment variable RUNWAYML_API_KEY by the client.
        """
        self.runway_client = RunwayMLClient(api_key=api_key)
        # Polling parameters
        self.poll_interval_seconds = 5  # Time to wait between status checks
        self.max_polling_attempts = 24  # Max number of retries (e.g., 24 * 5s = 120s timeout)

    async def _poll_task_until_completed(self, task_id: str) -> Dict:
        """
        Polls the status of a task until it is SUCCEEDED or FAILED.

        Args:
            task_id: The ID of the task to poll.

        Returns:
            The final task status response.

        Raises:
            TimeoutError: If the task does not complete within the max polling attempts.
            Exception: If the task fails.
        """
        for attempt in range(self.max_polling_attempts):
            task_status = await self.runway_client.get_task_status(task_id)

            status = task_status.get("status")
            print(f"Polling task {task_id}, attempt {attempt + 1}/{self.max_polling_attempts}. Status: {status}")

            if status == "SUCCEEDED":
                return task_status
            elif status == "FAILED":
                error_message = task_status.get("error_message", "Task failed without a specific error message.")
                raise Exception(f"Task {task_id} failed: {error_message}")
            elif status in ["PENDING", "RUNNING"]: # Add other potential in-progress statuses
                await asyncio.sleep(self.poll_interval_seconds)
            else: # Unknown status
                raise Exception(f"Task {task_id} returned an unknown status: {status}")

        raise TimeoutError(f"Task {task_id} did not complete within the allowed time.")

    async def _generate_initial_image_and_get_url(
        self, prompt: str, image_gen_options: Optional[Dict] = None
    ) -> str:
        """
        Generates an initial image from text and returns its URL upon completion.

        Args:
            prompt: The text prompt for image generation.
            image_gen_options: Optional dictionary of parameters for image generation.

        Returns:
            The URL of the generated image.

        Raises:
            Exception: If image generation fails or the URL cannot be extracted.
        """
        print(f"Submitting image generation task for prompt: '{prompt}'")
        image_task_response = await self.runway_client.generate_image_from_text(
            prompt, options=image_gen_options
        )

        task_id = image_task_response.get("id")
        if not task_id:
            raise Exception("Image generation task submission did not return a task ID.")
        print(f"Image generation task submitted with ID: {task_id}")

        completed_task = await self._poll_task_until_completed(task_id)

        # Extract image URL - structure based on assumed API response
        # Example: task.output[0]['url'] or task.output[0]['uri']
        try:
            # Check for 'outputs' key first, then 'output'
            if 'outputs' in completed_task and completed_task['outputs']:
                 output = completed_task['outputs'][0]
            elif 'output' in completed_task and completed_task['output']: # some APIs might use singular 'output'
                 output = completed_task['output'][0] if isinstance(completed_task['output'], list) else completed_task['output']
            else:
                raise KeyError("Neither 'outputs' nor 'output' key found in completed task response.")

            image_url = output.get("url") or output.get("uri")
            if not image_url:
                raise ValueError("Image URL not found in task output.")
            print(f"Image generated successfully. URL: {image_url}")
            return image_url
        except (KeyError, IndexError, TypeError, ValueError) as e:
            raise Exception(f"Failed to extract image URL from task output: {e}. Response: {completed_task}")


    async def submit_text_prompt_for_video_generation(
        self,
        prompt: str,
        user_id: str, # Included as per spec, though not used directly in this simplified version
        image_options: Optional[Dict] = None,
        video_options: Optional[Dict] = None,
    ) -> str:
        """
        Submits a text prompt to generate a video.
        This involves first generating an image, then using that image for video generation.

        Args:
            prompt: The primary text prompt for the generation.
            user_id: Identifier for the user requesting the video. (Currently logged only)
            image_options: Options for the initial image generation step.
            video_options: Options for the video generation step.

        Returns:
            The task ID for the video generation task.
        """
        print(f"Received text-to-video request for user '{user_id}' with prompt: '{prompt}'")

        # Step 1: Generate image from text
        generated_image_url = await self._generate_initial_image_and_get_url(
            prompt, image_gen_options=image_options
        )

        # Step 2: Generate video from the image
        print(f"Submitting video generation task using image: {generated_image_url}")
        video_task_response = await self.runway_client.generate_video_from_image(
            image_url=generated_image_url,
            prompt_for_video=prompt, # Can use the original prompt or a modified one
            options=video_options,
        )

        video_task_id = video_task_response.get("id")
        if not video_task_id:
            raise Exception("Video generation task submission did not return a task ID.")

        print(f"Video generation task submitted with ID: {video_task_id}. User: {user_id}")
        # In a real application, this video_task_id would be stored in a database (JOB_STORE)
        # associated with the user_id and original prompt for later status checks.
        # For this subtask, simply returning it is sufficient.
        return video_task_id

    async def check_video_status(self, video_job_id: str) -> Dict:
        """
        Checks the status of a video generation job.

        Args:
            video_job_id: The task ID of the video generation job.

        Returns:
            The status response from the RunwayML API.
        """
        print(f"Checking status for video job ID: {video_job_id}")
        return await self.runway_client.get_task_status(video_job_id)

# Example usage (for testing purposes)
async def main():
    # This example assumes RUNWAYML_API_KEY is set in the environment or passed to constructor.
    # Since actual API calls are not made, this is for structural verification.
    print("Initializing TextToVideoService...")
    try:
        # For local testing without real calls, pass a dummy key if env var not set
        service = TextToVideoService(api_key="dummy_key_for_testing_structure")
        print("TextToVideoService initialized.")

        prompt = "A serene beach at sunset with gentle waves"
        user_id = "user123"

        print(f"\nSimulating text-to-video submission for prompt: '{prompt}'")
        # This will simulate the flow. Without a live API, client methods will raise errors.
        # We expect this to fail at the client._request level if it tried to make a call.
        try:
            # To fully test the service logic without API calls, client methods would need mocking.
            # For this subtask, we confirm the structure and flow.
            # video_task_id = await service.submit_text_prompt_for_video_generation(prompt, user_id)
            # print(f"Video generation task ID (simulated): {video_task_id}")

            # if video_task_id:
            #     print(f"\nSimulating checking status for video task ID: {video_task_id}")
            #     status = await service.check_video_status(video_task_id)
            #     print(f"Video task status (simulated): {status}")
            print("Example main() in text_to_video_service.py: Code structure is ready.")
            print("Further testing would require mocking RunwayMLClient or a live API.")

        except aiohttp.ClientError as e: # Or whatever error your client throws on network issues
            print(f"Caught expected client error during simulation: {e}")
        except Exception as e:
            print(f"Simulation error: {e}")
            # For example, if _poll_task_until_completed tries to access attributes of a failed call
            # This indicates that for true unit/integration testing, mocking the client is essential.

    except ValueError as e: # e.g. API key not found
        print(f"Initialization error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    # To run this main function for basic structural check:
    # 1. Make sure aiohttp is installed: pip install aiohttp
    # 2. You can set a dummy API key: export RUNWAYML_API_KEY="test_key"
    # asyncio.run(main())
    print("TextToVideoService structure defined. Example main() function can be un-commented for testing (requires aiohttp and asyncio).")
