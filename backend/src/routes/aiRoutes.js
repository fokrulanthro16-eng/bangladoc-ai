const express = require("express");
const { fixGrammarText } = require("../services/aiService");

const router = express.Router();

router.post("/fix", async (req, res) => {
    try {
        const { text } = req.body || {};

        if (typeof text !== "string" || !text.trim()) {
            return res.status(400).json({
                error: "Text is required",
            });
        }

        const fixedText = await fixGrammarText(text);

        return res.json({
            fixedText,
        });
    } catch (error) {
        console.error("AI fix error:", error);
        return res.status(500).json({
            error: "Grammar fix failed",
        });
    }
});

module.exports = router;
