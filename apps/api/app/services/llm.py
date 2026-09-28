from collections.abc import Sequence
from typing import cast

from google import genai
from google.genai import types
from openai import OpenAI

from app.config import settings
from app.schemas.chat import Provider


def configured_provider(provider: Provider | None = None) -> Provider:
    selected = provider or settings.llm_provider
    if selected not in ("openai", "gemini"):
        raise ValueError("LLM_PROVIDER must be 'openai' or 'gemini'")
    return cast(Provider, selected)


def _require_key(provider: Provider) -> str:
    key = settings.openai_api_key if provider == "openai" else settings.gemini_api_key
    if not key:
        variable = "OPENAI_API_KEY" if provider == "openai" else "GEMINI_API_KEY"
        raise RuntimeError(f"{variable} is required for the selected provider")
    return key


def embed_texts(texts: Sequence[str], provider: Provider | None = None) -> list[list[float]]:
    selected = configured_provider(provider)
    if selected == "openai":
        client = OpenAI(api_key=_require_key(selected))
        result: list[list[float]] = []
        for start in range(0, len(texts), 64):
            response = client.embeddings.create(
                model=settings.openai_embedding_model,
                input=list(texts[start : start + 64]),
            )
            result.extend(item.embedding for item in response.data)
        return result

    client = genai.Client(api_key=_require_key(selected))
    result: list[list[float]] = []
    for start in range(0, len(texts), 64):
        response = client.models.embed_content(
            model=settings.gemini_embedding_model,
            contents=list(texts[start : start + 64]),
            config=types.EmbedContentConfig(output_dimensionality=settings.embedding_dimensions),
        )
        result.extend(embedding.values for embedding in response.embeddings)
    return result


def generate_text(system_prompt: str, user_prompt: str, provider: Provider | None = None) -> str:
    selected = configured_provider(provider)
    if selected == "openai":
        client = OpenAI(api_key=_require_key(selected))
        response = client.chat.completions.create(
            model=settings.openai_chat_model,
            temperature=0.1,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        return response.choices[0].message.content or "Insufficient evidence in the current knowledge base."

    client = genai.Client(api_key=_require_key(selected))
    response = client.models.generate_content(
        model=settings.gemini_chat_model,
        contents=user_prompt,
        config=types.GenerateContentConfig(system_instruction=system_prompt, temperature=0.1),
    )
    return response.text or "Insufficient evidence in the current knowledge base."