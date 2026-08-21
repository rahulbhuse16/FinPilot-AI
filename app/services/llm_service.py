from langchain_groq import ChatGroq

from app.core.config import settings


llm = ChatGroq(
    model=settings.openai_chat_model,
    temperature=0,
    api_key=settings.openai_api_key,
)


async def generate_answer(
    prompt,
):
    response = await llm.ainvoke(prompt)

    return response.content