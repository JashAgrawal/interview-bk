import { GoogleGenAI } from "@google/genai";
import { config } from "./env";

const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

export const generateResponseWithPassage = async (
  query: string,
  relevant_passage: string
) => {
  const prompt = `
You are a helpful and informative chatbot that answers questions using text from the reference passage included below. 
Respond in a complete sentence and make sure that your response is easy to understand for everyone. 
Maintain a friendly and conversational tone. If the passage is irrelevant, feel free to ignore it.

QUESTION: '${query}'
PASSAGE: '${relevant_passage}'

ANSWER:`;

  const chat = await ai.chats.create({
    model: "gemini-2.0-flash",
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
    config: {
      temperature: 0.5,
      topP: 0.2,
      topK: 40,
      systemInstruction:
        "You are a helpful and informative chatbot that answers questions using text from the reference passage included below. Respond in a complete sentence and make sure that your response is easy to understand for everyone. Maintain a friendly and conversational tone. If the passage is irrelevant, feel free to ignore it.",
    },
  });
  const response = await chat.sendMessage({
    message: prompt,
  });

  return response.text;
};
