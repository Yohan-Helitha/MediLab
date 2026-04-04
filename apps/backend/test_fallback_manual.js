import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { generateTextGroq } from "./src/modules/consultation/services/groqService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

/**
 * Mocking the logic in server.js but explicitly failing Gemini
 */
async function testFallback() {
  const prompt = "What are the common symptoms of a cold?";
  const sysInst = "You are Dr. MediLab.";

  console.log("--- START FALLBACK TEST ---");
  
  try {
    console.log("[Test] Simulating Gemini Failure (e.g. 429 Rate Limit)...");
    // We skip Gemini calls and go straight to Groq logic
    throw new Error("Simulated Gemini Quota Exhausted (429)");
  } catch (error) {
    console.warn(`[Test] Caught Gemini Error: ${error.message}`);
    console.log("[Test] Triggering Groq Fallback...");
    
    try {
      const result = await generateTextGroq(prompt, sysInst);
      if (result) {
        console.log("[Test] SUCCESS: Groq returned a response.");
        console.log("[Test] Groq Response Preview:", result.substring(0, 50) + "...");
        console.log("--- TEST PASSED: Fallback is functional ---");
      } else {
        console.error("[Test] FAILED: Groq returned empty response.");
      }
    } catch (groqError) {
      console.error("[Test] FAILED: Groq also failed:", groqError.message);
    }
  }
}

testFallback();
