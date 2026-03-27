const express = require("express");
const puppeteer = require("puppeteer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

function safeHtml(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function safeFileName(name) {
    return String(name || "document").replace(/[\\/:*?"<>|]/g, "_").trim() || "document";
}

router.post("/pdf", async (req, res, next) => {
    let browser;

    try {
        const { title = "Document", content = "" } = req.body;

        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();

        const safeTitle = safeHtml(title);
        const safeContent = safeHtml(content).replace(/\n/g, "<br/>");

        const html = `
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="UTF-8" />
          <title>${safeTitle}</title>
          <style>
            body {
              font-family: "Nirmala UI", "Arial Unicode MS", "Segoe UI", Arial, sans-serif;
              padding: 40px;
              line-height: 1.8;
              font-size: 14px;
              color: #111;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 20px 0;
              font-weight: 700;
            }
            .content {
              white-space: normal;
              word-break: break-word;
            }
          </style>
        </head>
        <body>
          <h1>${safeTitle}</h1>
          <div class="content">${safeContent}</div>
        </body>
      </html>
    `;

        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "20mm",
                right: "15mm",
                bottom: "20mm",
                left: "15mm",
            },
        });

        const finalBuffer = Buffer.from(pdfBuffer);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${safeFileName(title)}.pdf"`
        );
        res.setHeader("Content-Length", finalBuffer.length);

        res.end(finalBuffer);
    } catch (error) {
        next(error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

module.exports = router;
