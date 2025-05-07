import { geminiService } from "../config/GeminiClass";
import { embeddingService } from "../config/embeddingService";

/**
 * Stores embeddings in the collection
 * @deprecated Use embeddingService.populateCollection() instead
 */
export const storeEmbedings = async () => {
  await embeddingService.populateCollection();
};

/**
 * Clears embeddings from the collection
 * @deprecated Use embeddingService.clearCollection() instead
 */
export const clearEmbedings = async () => {
  await embeddingService.clearCollection();
};

/**
 * Queries the collection for relevant documents
 * @param query The query text
 * @returns The relevant documents as a string
 * @deprecated Use embeddingService.queryCollection() instead
 */
export const queryEmbeddings = async (query: string) => {
  return await embeddingService.queryCollection(query);
};

/**
 * Sets up the embedding collection by initializing it with fresh data
 * @returns The results of a test query
 */
export const setup = async () => {
  try {
    // Initialize the embedding service with force refresh
    await embeddingService.initialize(true);

    console.log("Embeddings stored");

    // Test query
    const results = await embeddingService.queryCollection("What is happening in the world?");
    console.log(results);

    return results;
  } catch (e) {
    console.error("Error in setup:", e);
    return null;
  }
};

/**
 * Generates a response based on a query using RAG
 * @param query The user's query
 * @returns The generated response
 */
export const generateRagBasedResponse = async (query: string) => {
  // Get relevant passages from the embedding collection
  const relevant_passage = await embeddingService.queryCollection(query);

  // Generate a response using the Gemini service
  const response = await geminiService.generateResponseWithPassage(query, relevant_passage);

  return response;
}