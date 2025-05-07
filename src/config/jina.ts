import { JinaEmbeddingFunction } from "chromadb";
import { config } from "./env";

export const embedder = new JinaEmbeddingFunction({
  api_key_env_var: "JINA_EMBEDDING_API_KEY",
  jinaai_api_key: config.JINA_EMBEDDING_API_KEY,
  model_name: "jina-embeddings-v2-base-en",
});

