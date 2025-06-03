import os

RUNWAYML_API_BASE_URL = "https://api.runwayml.com"

def get_runway_api_key() -> str:
    """
    Retrieves the RunwayML API key from the environment variable RUNWAYML_API_KEY.
    Raises an error if the environment variable is not set.
    """
    api_key = os.getenv("RUNWAYML_API_KEY")
    if not api_key:
        raise ValueError("RUNWAYML_API_KEY environment variable not set.")
    return api_key

if __name__ == '__main__':
    # Example of how to use it (optional, for testing)
    try:
        r_key = get_runway_api_key()
        print(f"RunwayML API Key: {r_key}")
        print(f"RunwayML API Base URL: {RUNWAYML_API_BASE_URL}")
    except ValueError as e:
        print(f"Runway Error: {e}")

    try:
        d_key = get_did_api_key()
        print(f"D-ID API Key: {d_key}")
        print(f"D-ID API Base URL: {DID_API_BASE_URL}")
    except ValueError as e:
        print(f"D-ID Error: {e}")

DID_API_BASE_URL = "https://api.d-id.com"

def get_did_api_key() -> str:
    """
    Retrieves the D-ID API key from the environment variable DID_API_KEY.
    Raises an error if the environment variable is not set.
    """
    api_key = os.getenv("DID_API_KEY")
    if not api_key:
        raise ValueError("DID_API_KEY environment variable not set.")
    return api_key
