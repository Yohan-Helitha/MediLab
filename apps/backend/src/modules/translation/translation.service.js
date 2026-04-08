import axios from "axios";
import config from "../../config/environment.js";

class TranslationService {
	constructor() {
		this.apiKey = config.googleTranslate.apiKey;
		this.baseUrl = "https://translation.googleapis.com/language/translate/v2";
	}

	/**
	 * Translate text using Google Cloud Translation API
	 * @param {string|string[]} text - Text or array of texts to translate
	 * @param {string} targetLanguage - Target language code (e.g. 'si', 'ta')
	 * @param {string} [sourceLanguage] - Optional source language code (e.g. 'en')
	 */
	async translate(text, targetLanguage, sourceLanguage) {
		if (!this.apiKey) {
			throw new Error("Translation service is not configured. Missing GOOGLE_TRANSLATE_API_KEY.");
		}

		if (!text || !targetLanguage) {
			throw new Error("Both text and targetLanguage are required.");
		}

		const texts = Array.isArray(text) ? text : [text];

		try {
			const response = await axios.post(
				`${this.baseUrl}?key=${this.apiKey}`,
				{
					q: texts,
					target: targetLanguage,
					format: "text",
					...(sourceLanguage ? { source: sourceLanguage } : {}),
				}
			);

			const translations = response.data?.data?.translations || [];
			return texts.map((original, index) => ({
				original,
				translatedText: translations[index]?.translatedText || "",
				detectedSourceLanguage:
					translations[index]?.detectedSourceLanguage || sourceLanguage || "",
			}));
		} catch (error) {
			console.error("Google Translation API error:", error.response?.data || error.message);

			if (error.response?.status === 403 || error.response?.status === 401) {
				throw new Error("Translation API authentication failed. Please check your API key and billing.");
			}

			throw new Error(
				error.response?.data?.error?.message ||
					"Failed to translate text using Google Cloud Translation API."
			);
		}
	}
}

export default new TranslationService();
