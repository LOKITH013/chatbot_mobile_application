import os
from groq import Groq

_client = None


def get_client() -> Groq:
    global _client

    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Add it to .env file."
            )
        _client = Groq(api_key=api_key)

    return _client


def call_llm(prompt: str) -> str:
    """
    Calls Groq LLM and returns raw text response.
    """
    client = get_client()

    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[
            {"role": "system", "content": "You are an NLP parser."},
            {"role": "user", "content": prompt},
        ],
        temperature=0,
    )

    return response.choices[0].message.content
