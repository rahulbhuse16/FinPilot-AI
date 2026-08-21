from langchain_community.embeddings.fastembed import FastEmbedEmbeddings

embeddings = FastEmbedEmbeddings(
    model_name="BAAI/bge-small-en-v1.5"
)


async def generate_embeddings(
    texts: list[str],
) -> list[list[float]]:
    return await embeddings.aembed_documents(texts)