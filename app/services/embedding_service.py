from langchain_huggingface import HuggingFaceEmbeddings


embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


async def generate_embeddings(
    texts: list[str],
) -> list[list[float]]:
    return await embeddings.aembed_documents(texts)