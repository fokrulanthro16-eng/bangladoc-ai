const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

function safeUse(routePath, filePath) {
    try {
        const loaded = require(filePath);
        const router = loaded && loaded.default ? loaded.default : loaded;

        if (typeof router === "function") {
            app.use(routePath, router);
            console.log(`Loaded route: ${routePath}`);
        } else {
            console.warn(`Skipped route (not a router): ${filePath}`);
        }
    } catch (error) {
        console.warn(`Skipped route ${filePath}: ${error.message}`);
    }
}

app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        message: "Backend is running",
    });
});

safeUse("/api/ai", "./routes/aiRoutes");
safeUse("/api/auth", "./routes/authRoutes");
safeUse("/api/document", "./routes/documentRoutes");
safeUse("/api/docx", "./routes/docxRoutes");
safeUse("/api/export", "./routes/exportRoutes");
safeUse("/api/upload", "./routes/uploadRoutes");

app.use((req, res) => {
    res.status(404).json({
        error: "Route not found",
    });
});

app.use((error, req, res, next) => {
    console.error("Server error:", error);
    res.status(500).json({
        error: "Internal server error",
    });
});

module.exports = app;