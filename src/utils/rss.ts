import Parser from "rss-parser";
import { config } from "../config";
import { ProcessedFeed, FeedItem } from "../types";

/**
 * RSS parser instance
 */
const parser = new Parser();

/**
 * Fetches and processes RSS feed data
 * @param url Optional RSS feed URL (defaults to the one in environment config)
 * @returns Processed feed data ready for embedding
 */
export const getFeed = async (url: string = config.RSS_URL): Promise<ProcessedFeed> => {
  try {
    // Parse the RSS feed
    const feed = await parser.parseURL(url);
    
    // Initialize arrays for processed data
    const docs: string[] = [];
    const metadatas: Record<string, string>[] = [];
    const ids: string[] = [];
    
    // Process each feed item
    feed.items.forEach((item: any, index: number) => {
      // Format the document text
      const itemString = `
      Title: ${item.title || 'No title'}
      Published Date: ${item.pubDate || 'No date'}
      Link: ${item.link || 'No link'}
      Content: ${item.content || item.contentSnippet || 'No content'}
      `;
      
      // Create metadata
      const metadata: Record<string, string> = {
        url: item.link || '',
        title: item.title || '',
        pubDate: item.pubDate || '',
      };
      
      // Generate a unique ID
      const id = `${index + 1}`;
      
      // Add to arrays
      docs.push(itemString);
      metadatas.push(metadata);
      ids.push(id);
    });
    
    return { docs, metadatas, ids };
  } catch (error) {
    console.error("Error fetching RSS feed:", error);
    throw new Error(`Failed to fetch RSS feed: ${error}`);
  }
};
