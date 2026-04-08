import axios from "axios";
import config from "../../config/environment.js";

class TranslationService {
	constructor() {
		this.apiKey = config.googleTranslate.apiKey;
		this.baseUrl = "https://translation.googleapis.com/language/translate/v2";
		// Simple in-memory cache to avoid paying for the same
		// translation repeatedly during the lifetime of this server.
		// Key format: `${source}|${target}|${text}`
		this.cache = new Map();
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
		const target = (targetLanguage || "").toLowerCase();
		const source = (sourceLanguage || "").toLowerCase();

		// 1) Try to resolve as many as possible from cache first
		const results = new Array(texts.length);
		const toTranslate = [];
		const toTranslateIndices = [];

		texts.forEach((original, index) => {
			const key = this._cacheKey(original, target, source);
			if (this.cache.has(key)) {
				const cached = this.cache.get(key);
				results[index] = {
					original,
					translatedText: cached.text,
					detectedSourceLanguage: cached.detectedSourceLanguage || source || "",
				};
			} else {
				toTranslate.push(original);
				toTranslateIndices.push(index);
			}
		});

		// If everything was in cache, we are done – no external API call
		if (!toTranslate.length) {
			return results;
		}

		try {
			const response = await axios.post(
				`${this.baseUrl}?key=${this.apiKey}`,
				{
					q: toTranslate,
					target: targetLanguage,
					format: "text",
					...(sourceLanguage ? { source: sourceLanguage } : {}),
				}
			);

			const translations = response.data?.data?.translations || [];

			toTranslate.forEach((original, localIndex) => {
				const globalIndex = toTranslateIndices[localIndex];
				const translation = translations[localIndex] || {};
				const translatedText = translation.translatedText || "";
				const detectedSourceLanguage =
					translation.detectedSourceLanguage || sourceLanguage || "";

				// Save into cache for future calls
				const key = this._cacheKey(original, target, source);
				this.cache.set(key, {
					text: translatedText,
					detectedSourceLanguage,
				});

				results[globalIndex] = {
					original,
					translatedText,
					detectedSourceLanguage,
				};
			});

			return results;
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

	_cacheKey(text, targetLanguage, sourceLanguage) {
		return `${sourceLanguage || "auto"}|${targetLanguage || ""}|${text}`;
	}
}

export default new TranslationService();
