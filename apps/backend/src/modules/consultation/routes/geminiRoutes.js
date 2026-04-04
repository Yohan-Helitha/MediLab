import express from "express";
import { generateText } from "../services/aiService.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
  const { message, userName, history } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    let prompt = "";
    
    // Construct context-aware prompt using a structured conversation format
    // Pass ALL history from the current session for absolute continuity
    if (history && Array.isArray(history) && history.length > 0) {
      const formattedHistory = history.map(h => `${h.role === 'user' ? 'Patient' : 'Dr. MediLab'}: ${h.content}`).join("\n");
      prompt = `--- PREVIOUS MESSAGES IN THIS SESSION ---\n${formattedHistory}\n------------------------------------------\n\n`;
    }

    if (userName) {
      prompt += `USER PROFILE: The patient's name is ${userName}.\n`;
    }
    
    prompt += `LATEST PATIENT MESSAGE: ${message}\n\n`;
    prompt += `CRITICAL DIRECTIVE: You are Dr. MediLab. 
1. READ THE HISTORY: Look at the last message you sent before the patient said "${message}". 
2. FOLLOW THE FLOW: If you asked a question like "Would you like to know more?" and the patient said "yes", IMMEDIATELY provide that information. 
3. DO NOT RESET: Do not say "Hello" or ask for a name. You are in the middle of a consultation. Respond directly to the flow of the conversation.`;

    const reply = await generateText(prompt);
    res.json({ reply });
  } catch (err) {
    console.error("[AI Chat Route Error]:", err.message);
    res.status(500).json({ error: "AI Chatbot is currently unavailable. Please try again later." });
  }
});

export default router;