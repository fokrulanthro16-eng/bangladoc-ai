const express = require("express");
const multer = require("multer");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const Tesseract = require("tesseract.js");

const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.use(authMiddleware);

router.post("/image", upload.single("image"), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image লাগবে" });
        }

        const result = await Tesseract.recognize(req.file.path, "eng");
        const extractedText = result.data.text || "";

        const dbRes = await pool.query(
            `INSERT INTO uploads
       (user_id, file_name, original_name, mime_type, file_path, file_size, upload_type, ocr_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
            [
                req.user.id,
                req.file.filename,
                req.file.originalname,
                req.file.mimetype,
                req.file.path,
                req.file.size,
                "image",
                extractedText,
            ]
        );

        res.status(201).json({
            ...dbRes.rows[0],
            extractedText,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;