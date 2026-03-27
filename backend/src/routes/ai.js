import express from "express";
import OpenAI from "openai";

const router = express.Router();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post("/fix", async (req, res) => {
    const { text } = req.body;

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "Fix Bangla grammar properly",
            },
            {
                role: "user",
                content: text,
            },
        ],
    });

    res.json({ result: response.choices[0].message.content });
});

router.post("/rewrite", async (req, res) => {
    const { text } = req.body;

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "Rewrite this in better Bangla",
            },
            {
                role: "user",
                content: text,
            },
        ],
    });

    res.json({ result: response.choices[0].message.content });
});

router.post("/generate", async (req, res) => {
    const { prompt } = req.body;

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "Generate Bangla content",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    res.json({ result: response.choices[0].message.content });
});

export default router;
