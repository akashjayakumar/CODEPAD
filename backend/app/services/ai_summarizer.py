import os
from typing import Dict, Any
from dotenv import load_dotenv
from google import genai
from google.api_core import exceptions

# Load environment variables from .env file
load_dotenv()

# Initialize the client with API key from environment variable
api_key = os.getenv("GOOGLE_AI_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_AI_API_KEY environment variable is not set")

client = genai.Client(api_key=api_key)
def summarize_diff(diff_text: str) -> Dict[str, Any]:
    if not diff_text.strip():
        return {"error": "No diff text provided"}

    try:
        prompt = (
            "Please analyze the following code changes and provide a clear, concise summary. "
            "Explain additions, removals, modifications, and the purpose of the changes. "
            "Mention any issues or improvements.\n\n"
            f"{diff_text}"
        )

        # NEW GOOGLE GENAI API FORMAT (2024+)
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )

        return {
            "summary": response.text,
            "model": "gemini-1.5-flash",
            "success": True
        }

    except exceptions.InvalidArgument as e:
        return {
            "error": "Invalid API key or configuration",
            "details": str(e),
            "success": False
        }

    except Exception as e:
        return {
            "error": f"Failed to generate summary: {str(e)}",
            "success": False
        }
