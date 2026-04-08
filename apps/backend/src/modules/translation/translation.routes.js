import express from "express";
import { translateText } from "./translation.controller.js";

const router = express.Router();

// Simple translation endpoint for external API integration
// POST /api/translation/translate
router.post("/translate", translateText);

export default router;
