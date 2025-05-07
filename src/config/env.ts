require('dotenv').config();

export const config = {
    PORT: process.env.PORT || 3000,
    RSS_URL: process.env.RSS_URL || 'http://rss.cnn.com/rss/cnn_topstories.rss',
    JINA_EMBEDDING_API_KEY: process.env.JINA_EMBEDDING_API_KEY || '',
    CHROMA_API_HOST: process.env.CHROMA_API_HOST || 'http://localhost:8000',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    CHROMA_COLLECTION_NAME: process.env.CHROMA_COLLECTION_NAME || 'news',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379'
}