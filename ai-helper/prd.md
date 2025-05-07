Here’s a Product Requirements Document (PRD) tailored for your RAG-powered chatbot for news websites, in the context of the Verifast assignment:

---

## 📄 Product Requirements Document (PRD)

**Product Name:** NewsGPT – AI Chatbot for News Websites
**Prepared For:** Verifast – Full Stack Developer Assignment
**Owner:** Jash Agrawal
---

### 1. **Objective**

Develop a full-stack AI chatbot that uses a Retrieval-Augmented Generation (RAG) pipeline to answer user queries based on a corpus of recent news articles. The chatbot should support session-based interactions, in-memory history storage, a responsive frontend, and a streaming/chat-like experience.

---

### 2. **Problem Statement**

Users often struggle to stay updated or find specific information within large volumes of news content. Traditional search lacks contextual understanding. We aim to solve this by building a conversational AI that retrieves relevant news passages and generates intelligent, concise responses.

---

### 3. **User Stories**

#### 🧑‍💻 Visitor (Anonymous User)

* As a visitor, I want to ask questions and receive answers based on current news articles.
* As a visitor, I want my session to be uniquely identified without needing to log in.
* As a visitor, I want to see my chat history during my session.
* As a visitor, I want to reset my session and clear my history.

#### 🧑‍💼 Developer/Admin

* As a developer, I want to ingest news articles via RSS feeds or web scraping.
* As a developer, I want to embed and store news content in a vector database.
* As a developer, I want to ensure fast and accurate query handling via the RAG pipeline.
* As a developer, I want to cache recent chat history in Redis for performance.

---

### 4. **Technical Requirements**

#### 4.1 RAG Pipeline

* **Ingestion:** Scrape or fetch \~50 recent news articles via rss .
* **Embedding:** Use Jina Embeddings sdk.
* **Vector DB:** Store embeddings in Chroma.
* **Retrieval:** On query, retrieve top-k relevant passages.
* **Generation:** Use Google Gemini API to generate final response based on retrieved passages.

#### 4.2 Backend (API)

* **Framework:** Express Js Typescript
* **Endpoints:**

  * `POST /chat`: Accepts query, returns response.
  * `GET /session/history`: Returns current session's chat history.
  * `POST /session/reset`: Clears session.
* **Session Management:** Unique session ID per visitor via UUID (cookie or header).
* **Cache:** Redis to store chat history (with TTL e.g., 30 mins).
* **Optional:** Persist chat logs in Postgres for analytics or debugging.

#### 4.3 Frontend (React + Tailwind CSS)

* **UI Pages:**

  * Chat Interface:

    * Message history
    * Input box for new messages
    * Streaming or simulated typing response
    * Reset session button
* **API Integration:** Call backend endpoints via Axios/Fetch.
* **UX Considerations:** Mobile responsive, minimal and clean UI.


### 5. **Success Criteria**

| Metric                     | Target                          |
| -------------------------- | ------------------------------- |
| Time to first answer       | < 2 seconds                     |
| Chat retention per session | >= 5 messages                   |
| Response relevance         | >= 80% accuracy (manual review) |
| Session memory TTL         | 30 mins (configurable)          |
| Vector DB latency          | < 200ms on top-k retrieval      |

---

### 6. **Stretch Goals (Optional but Valuable)**

* Add speech-to-text input.
* Add feedback buttons (👍 / 👎) on each bot response.
* Session persistence in Postgres.
* Caching retrieval results for faster second access.

---

We are using gemini , chroma (vector db) , jina-ai (to create embeddings). 
