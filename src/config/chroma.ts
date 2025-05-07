import { ChromaClient } from "chromadb";
import { config } from "./env";
const client = new ChromaClient({ path: config.CHROMA_API_HOST });

export const getChromaCollection = async (name: string, embedder: any) => {
  return await client.getOrCreateCollection({
    name,
    embeddingFunction: embedder,
  });
};

