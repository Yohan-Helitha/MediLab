import translationService from "./translation.service.js";

// POST /api/translation/translate
export async function translateText(req, res, next) {
	try {
		const { text, targetLanguage, sourceLanguage } = req.body || {};

		if (!text || !targetLanguage) {
			return res.status(400).json({
				success: false,
				message: "text and targetLanguage are required",
			});
		}

		const result = await translationService.translate(
			text,
			targetLanguage,
			sourceLanguage
		);

		return res.json({ success: true, data: result });
	} catch (error) {
		// Let global error handler format the response
		next(error);
	}
}
