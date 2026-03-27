const express = require("express");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, title, content, source_type, language, status, created_at, updated_at
       FROM documents
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
            [req.user.id]
        );

        res.json(result.rows);
    } catch (error) {
        next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM documents WHERE id = $1 AND user_id = $2",
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Document পাওয়া যায়নি" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const {
            title = "Untitled Document",
            content = "",
            source_type = "manual",
            language = "mixed",
            status = "draft",
        } = req.body;

        const result = await pool.query(
            `INSERT INTO documents (user_id, title, content, source_type, language, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [req.user.id, title, content, source_type, language, status]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        const { title, content, language, status } = req.body;

        const result = await pool.query(
            `UPDATE documents
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           language = COALESCE($3, language),
           status = COALESCE($4, status),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
            [title, content, language, status, req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Document পাওয়া যায়নি" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const result = await pool.query(
            "DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING id",
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Document পাওয়া যায়নি" });
        }

        res.json({ message: "Document delete হয়েছে" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;