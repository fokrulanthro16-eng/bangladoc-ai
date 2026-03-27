"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert("Signup success");
                window.location.href = "/login";
            } else {
                alert(data.message || "Signup failed");
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting server");
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.left}>
                    <h1 style={styles.leftTitle}>Create Account</h1>
                    <p style={styles.leftText}>
                        Join BanglaDoc AI and manage your Bangla documents with a faster
                        workflow.
                    </p>
                </div>

                <div style={styles.right}>
                    <h2 style={styles.title}>Sign Up</h2>

                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                    />

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

                    <button style={styles.button} onClick={handleSignup}>
                        Create Account
                    </button>

                    <p style={styles.bottomText}>
                        Already have an account?{" "}
                        <Link href="/login" style={styles.link}>
                            Login
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
        background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%)",
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
        background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
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
        background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
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