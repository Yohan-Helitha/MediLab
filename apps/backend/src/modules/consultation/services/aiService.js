import { GoogleGenAI } from "@google/genai";
import { generateTextGroq } from "./groqService.js";

// ── System instruction shared by both Gemini & Groq ─────────────────────────
const SYSTEM_INSTRUCTION =
  "You are 'Dr. MediLab', a friendly, professional AI Doctor. " +
  "PRIMARY DIRECTIVE: You are in an ongoing conversation. NEVER reset or restart the discussion. " +
  "1. RECOGNITION: Scan the provided 'PREVIOUS MESSAGES' meticulously. If you see that you already introduced yourself or the patient gave symptoms, DO NOT ask again. " +
  "2. FLOW: If the patient says 'yes' to your previous question (e.g., 'Would you like to know more about testing?'), check the message immediately above to see what you offered and then provide that information. " +
  "3. NO REPETITION: Once you have said 'I am Dr. MediLab', never say it again. " +
  "4. NAME RULE: Do not ask for the user's name if it appears anywhere in the history or profile. " +
  "5. SCOPE: Only health and MediLab navigation. " +
  "6. MEDICATION: NEVER name medications. Say: 'I cannot provide medication advice.'";

// ── Gemini call ───────────────────────────────────────────────────────────────
const callGemini = async (prompt) => {
  const ai = getGemini();
  const model = ai.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION 
  });

  console.log(`[AI:Gemini] Sending request (${prompt.length} chars)...`);

  const response = await model.generateContent(prompt);

  // Handle response text properly
  const text = response.response.text();

  if (!text) throw new Error("Gemini returned an empty response.");
  console.log(`[AI:Gemini] OK – ${text.length} chars`);
  return text;
};

// ── Main export used by the route ─────────────────────────────────────────────
export const generateText = async (prompt, retryCount = 0) => {
  try {
    return await callGemini(prompt);
  } catch (error) {
    const status = error.status ?? error?.response?.status;
    const msg = error.message ?? "Unknown error";

    // Retry on rate-limit / overload (max 2 retries)
    if ((status === 429 || status === 503) && retryCount < 2) {
      const delay = 2000 * (retryCount + 1);
      console.warn(`[AI:Gemini] ${status} – retrying in ${delay / 1000}s… (attempt ${retryCount + 1})`);
      await new Promise((r) => setTimeout(r, delay));
      return generateText(prompt, retryCount + 1);
    }

    // All other errors → fall through to Groq
    console.warn(`[AI:Gemini] FAILED (${msg}). Falling back to Groq…`);
    try {
      const groqText = await generateTextGroq(prompt, SYSTEM_INSTRUCTION);
      if (!groqText) throw new Error("Groq returned empty text.");
      console.log(`[AI:Groq] Fallback SUCCESS – ${groqText.length} chars`);
      return groqText;
    } catch (groqErr) {
      console.error(`[AI:Groq] ALSO FAILED: ${groqErr.message}`);
      throw new Error(`Both AI providers failed. Last error: ${groqErr.message}`);
    }
  }
};
