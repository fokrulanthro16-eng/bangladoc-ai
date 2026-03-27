"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:5001/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await res.json();

            console.log("LOGIN RESPONSE:", data);

            if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                alert("Login success");
                window.location.href = "/editor";
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            console.error("LOGIN ERROR:", err);
            alert("Server error");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.left}>
                    <div style={styles.brand}>BanglaDoc AI</div>
                    <h1 style={styles.leftTitle}>Welcome Back</h1>
                    <p style={styles.leftText}>
                        Smart Bangla drafting, OCR, export and document workflow in one
                        place.
                    </p>
                </div>

                <div style={styles.right}>
                    <h2 style={styles.title}>Login</h2>

                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                    />

                    <button style={styles.button} onClick={handleLogin}>
                        Continue Securely
                    </button>

                    <p style={styles.bottomText}>
                        New here?{" "}
                        <Link href="/signup" style={styles.link}>
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(135deg, #22c55e 0%, #06b6d4 50%, #3b82f6 100%)",
    },
    card: {
        width: "100%",
        maxWidth: "1000px",
        minHeight: "560px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderRadius: "28px",
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 25px 60px rgba(0,0,0,0.20)",
    },
    left: {
        padding: "56px",
        color: "#ffffff",
        background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
    },
    brand: {
        fontSize: "18px",
        fontWeight: 700,
        marginBottom: "20px",
    },
    leftTitle: {
        fontSize: "44px",
        lineHeight: 1.1,
        margin: "0 0 16px 0",
    },
    leftText: {
        fontSize: "18px",
        lineHeight: 1.7,
        margin: 0,
        opacity: 0.95,
    },
    right: {
        padding: "56px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        background: "#ffffff",
    },
    title: {
        fontSize: "34px",
        margin: "0 0 24px 0",
        color: "#0f172a",
    },
    input: {
        width: "100%",
        padding: "16px 18px",
        marginBottom: "16px",
        borderRadius: "14px",
        border: "1px solid #cbd5e1",
        fontSize: "16px",
        outline: "none",
        background: "#f8fafc",
    },
    button: {
        width: "100%",
        padding: "16px",
        borderRadius: "14px",
        border: "none",
        background: "linear-gradient(135deg, #22c55e 0%, #2563eb 100%)",
        color: "#ffffff",
        fontSize: "16px",
        fontWeight: 700,
        cursor: "pointer",
        marginTop: "8px",
    },
    bottomText: {
        marginTop: "20px",
        textAlign: "center",
        color: "#475569",
        fontSize: "15px",
    },
    link: {
        color: "#2563eb",
        fontWeight: 700,
        textDecoration: "none",
    },
};