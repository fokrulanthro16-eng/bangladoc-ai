const express = require("express");
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
} = require("docx");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

function hasBangla(text) {
    return /[\u0980-\u09FF]/.test(String(text || ""));
}

function safeFileName(name) {
    return String(name || "document").replace(/[\\/:*?"<>|]/g, "_").trim() || "document";
}

router.post("/docx", async (req, res, next) => {
    try {
        const { title = "Document", content = "" } = req.body;

        const lines = String(content || "").split("\n");

        const children = [];

        children.push(
            new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { after: 240 },
                children: [
                    new TextRun({
                        text: title,
                        bold: true,
                        size: 32,
                        font: hasBangla(title) ? "Nirmala UI" : "Arial",
                    }),
                ],
            })
        );

        lines.forEach((line) => {
            children.push(
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 120 },
                    children: [
                        new TextRun({
                            text: line || " ",
                            size: 24,
                            font: hasBangla(line) ? "Nirmala UI" : "Arial",
                        }),
                    ],
                })
            );
        });

        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children,
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${safeFileName(title)}.docx"`
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

        res.send(buffer);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
