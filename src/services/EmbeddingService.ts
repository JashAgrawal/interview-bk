import { ChromaClient, Collection } from "chromadb";
import { JinaEmbeddingFunction } from "chromadb";
import { config } from "../config";
import { getFeed } from "../utils";
import { ProcessedFeed } from "../types";

/**
 * EmbeddingService - A class-based service for managing embeddings in Chroma vector database
 *
 * This class provides functionality to:
 * 1. Check if a collection exists and is populated
 * 2. Create and populate a collection if needed
 * 3. Query the collection for relevant documents
 * 4. Manage the lifecycle of the embedding collection
 */
export class EmbeddingService {
  private client: ChromaClient;
  private embedder: JinaEmbeddingFunction;
  private collectionName: string;
  private collection: Collection | null = null;
  private isInitialized: boolean = false;

  /**
   * Creates a new instance of the EmbeddingService
   * @param collectionName The name of the collection to use (defaults to "news")
   * @param chromaHost The host URL for the Chroma API (defaults from config)
   * @param jinaApiKey The API key for Jina embeddings (defaults from config)
   */
  constructor(
    collectionName: string = config.CHROMA_COLLECTION_NAME,
    chromaHost: string = config.CHROMA_API_HOST,
    jinaApiKey: string = config.JINA_EMBEDDING_API_KEY
  ) {
    this.client = new ChromaClient({ path: chromaHost });
    this.embedder = new JinaEmbeddingFunction({
      api_key_env_var: "JINA_EMBEDDING_API_KEY",
      jinaai_api_key: jinaApiKey,
      model_name: "jina-embeddings-v2-base-en",
    });
    this.collectionName = collectionName;
  }

  /**
   * Initializes the embedding service by checking if the collection exists and is populated
   * If not, it creates and populates the collection
   * @param forceRefresh Whether to force a refresh of the collection (defaults to false)
   * @returns A promise that resolves when initialization is complete
   */
  public async initialize(forceRefresh: boolean = false): Promise<void> {
    try {
      // Get or create the collection
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        embeddingFunction: this.embedder,
      });

      // Check if collection is empty or force refresh is requested
      const collectionCount = await this.getCollectionCount();

      if (forceRefresh || collectionCount === 0) {
        console.log(`Collection ${this.collectionName} is empty or refresh requested. Populating...`);
        await this.populateCollection();
      } else {
        console.log(`Collection ${this.collectionName} already exists with ${collectionCount} documents.`);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing embedding service:", error);
      throw new Error(`Failed to initialize embedding service: ${error}`);
    }
  }

  /**
   * Gets the count of documents in the collection
   * @returns The number of documents in the collection
   */
  private async getCollectionCount(): Promise<number> {
    if (!this.collection) {
      throw new Error("Collection not initialized");
    }

    try {
      const count = await this.collection.count();
      return count;
    } catch (error) {
      console.error("Error getting collection count:", error);
      return 0;
    }
  }

  /**
   * Populates the collection with documents from the RSS feed
   * @returns A promise that resolves when population is complete
   */
  public async populateCollection(): Promise<void> {
    if (!this.collection) {
      throw new Error("Collection not initialized");
    }

    try {
      // Clear existing data
      await this.collection.delete();

      // Recreate the collection
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        embeddingFunction: this.embedder,
      });

      // Get feed data
      const feed: ProcessedFeed = await getFeed();

      // Add documents to collection
      await this.collection.add({
        documents: feed.docs,
        metadatas: feed.metadatas,
        ids: feed.ids,
      });

      console.log(`Successfully populated collection with ${feed.docs.length} documents.`);
    } catch (error) {
      console.error("Error populating collection:", error);
      throw new Error(`Failed to populate collection: ${error}`);
    }
  }

  /**
   * Queries the collection for documents relevant to the query
   * @param query The query text
   * @param nResults The number of results to return (defaults to 5)
   * @returns The relevant documents as a string
   */
  public async queryCollection(query: string, nResults: number = 5): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.collection) {
      throw new Error("Collection not initialized");
    }

    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults,
      });

      // Join the documents into a single string
      return results.documents[0]?.join("\n") || "";
    } catch (error) {
      console.error("Error querying collection:", error);
      throw new Error(`Failed to query collection: ${error}`);
    }
  }

  /**
   * Clears the collection by deleting all documents
   * @returns A promise that resolves when the collection is cleared
   */
  public async clearCollection(): Promise<void> {
    if (!this.collection) {
      throw new Error("Collection not initialized");
    }

    try {
      await this.collection.delete();

      // Recreate the empty collection
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        embeddingFunction: this.embedder,
      });

      console.log(`Collection ${this.collectionName} cleared successfully.`);
    } catch (error) {
      console.error("Error clearing collection:", error);
      throw new Error(`Failed to clear collection: ${error}`);
    }
  }

  /**
   * Gets the collection instance
   * @returns The collection instance
   */
  public getCollection(): Collection | null {
    return this.collection;
  }
}
