import express from "express";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, "../data/users.json");

function readUsers() {
    try {
        const data = fs.readFileSync(usersFilePath, "utf-8");
        return JSON.parse(data || "[]");
    } catch (error) {
        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "সব field লাগবে" });
        }

        const users = readUsers();

        const existingUser = users.find(
            (user) => user.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return res.status(400).json({ message: "এই email already use হচ্ছে" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
        };

        users.push(newUser);
        writeUsers(users);

        return res.status(201).json({
            message: "Signup success",
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password লাগবে" });
        }

        const users = readUsers();

        const user = users.find(
            (u) => u.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            return res.status(400).json({ message: "User পাওয়া যায়নি" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Password ভুল" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            process.env.JWT_SECRET || "bangladoc_secret",
            { expiresIn: "7d" }
        );

        return res.json({
            message: "Login success",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

export default router;