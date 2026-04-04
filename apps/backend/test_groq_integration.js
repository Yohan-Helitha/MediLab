import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath });

async function testGroq() {
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  try {
    console.log("-----------------------------------------");
    console.log("Testing Groq API Integration...");
    console.log("Using API Key:", process.env.GROQ_API_KEY ? "Found" : "NOT FOUND");
    
    if (!process.env.GROQ_API_KEY) {
      console.error("Error: GROQ_API_KEY not found in environment.");
      return;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are 'Dr. MediLab', a professional AI assistant." },
        { role: "user", content: "Hello, what services do you provide?" }
      ],
      model: "llama-3.3-70b-versatile",
    });

    console.log("Groq Response Status: SUCCESS");
    console.log("Groq Response Preview:", completion.choices[0]?.message?.content.substring(0, 100) + "...");
    console.log("-----------------------------------------");
    console.log("Groq test PASSED!");
  } catch (error) {
    console.error("-----------------------------------------");
    console.error("Groq test FAILED!");
    console.error("Error Message:", error.message);
    console.error("-----------------------------------------");
  }
}

testGroq();
