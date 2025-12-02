from google import genai

client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

def summarize_diff(diff_text: str):
    prompt = f"Explain the following Python code changes in simple terms:\n\n{diff_text}"

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=[prompt]
    )

    return {"summary": response.text}
