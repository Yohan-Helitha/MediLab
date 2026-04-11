import { apiRequest } from "./client";

/**
 * Translate a list of texts using the backend Translation API.
 * Returns a map: originalText -> translatedText.
 * If targetLanguage is 'en' or request fails, falls back to originals.
 */
export async function translateTexts(texts, targetLanguage, sourceLanguage = "EN") {
  const unique = Array.from(
    new Set((texts || []).filter((v) => typeof v === "string" && v.trim().length > 0))
  );

  if (!unique.length || !targetLanguage || targetLanguage.toLowerCase() === sourceLanguage.toLowerCase()) {
    return Object.fromEntries(unique.map((t) => [t, t]));
  }

  try {
    const response = await apiRequest("/api/translation/translate", {
      method: "POST",
      body: JSON.stringify({
        text: unique,
        targetLanguage,
        sourceLanguage,
      }),
    });

    const data = response?.data || [];
    const map = {};
    unique.forEach((original, index) => {
      const translated = data[index]?.translatedText || original;
      map[original] = translated;
    });
    return map;
  } catch (error) {
    console.error("Dynamic translation failed, falling back to original text:", error.message);
    return Object.fromEntries(unique.map((t) => [t, t]));
  }
}
