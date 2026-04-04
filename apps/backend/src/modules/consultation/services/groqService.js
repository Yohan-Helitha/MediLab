import Groq from "groq-sdk";

let groqInstance = null;

const getGroq = () => {
  if (!groqInstance) {
    if (!process.env.GROQ_API_KEY) {
      console.error("[Groq] FATAL: GROQ_API_KEY is missing from process.env");
      throw new Error("GROQ_API_KEY not configured.");
    }
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqInstance;
};

/**
 * Generate text using Groq's Llama model
 * @param {string} prompt - The user prompt
 * @param {string} systemInstruction - Optional system instruction
 * @returns {Promise<string>} AI response text
 */
export const generateTextGroq = async (prompt, systemInstruction = "") => {
  try {
    const groq = getGroq();
    console.log(`[Groq] Attempting text generation. Input length: ${prompt.length} chars`);
    
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: "system", content: systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const content = completion.choices[0]?.message?.content || "";
    if (content) {
      console.log(`[Groq] Response received. length: ${content.length} chars`);
    } else {
      console.warn("[Groq] Received empty response.");
    }
    
    return content;
  } catch (error) {
    console.error(`[Groq Service Error]: ${error.message}`);
    throw error;
  }
};
