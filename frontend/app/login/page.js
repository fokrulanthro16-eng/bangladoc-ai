"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            const res = await fetch(`${apiUrl}/api/auth/login`, {
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
            alert("Error connecting server");
        }
    };

    return (
        <>
            <div className="login-page">
                <div className="login-card">
                    <div className="login-left">
                        <div className="brand">BanglaDoc AI</div>
                        <h1>Welcome Back</h1>
                        <p>
                            Smart Bangla drafting, OCR, export and document workflow in one
                            place.
                        </p>
                    </div>

                    <div className="login-right">
                        <h2>Login</h2>

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button onClick={handleLogin}>Continue Securely</button>

                        <p className="bottom-text">
                            New here? <Link href="/signup">Create account</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: linear-gradient(135deg, #22c55e 0%, #06b6d4 50%, #3b82f6 100%);
        }

        .login-card {
          width: 100%;
          max-width: 1000px;
          min-height: 560px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: 28px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
        }

        .login-left {
          padding: 56px;
          color: #ffffff;
          background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .login-left h1 {
          font-size: 44px;
          line-height: 1.1;
          margin: 0 0 16px 0;
        }

        .login-left p {
          font-size: 18px;
          line-height: 1.7;
          margin: 0;
          opacity: 0.95;
        }

        .login-right {
          padding: 56px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #ffffff;
        }

        .login-right h2 {
          font-size: 34px;
          margin: 0 0 24px 0;
          color: #0f172a;
        }

        .login-right input {
          width: 100%;
          padding: 16px 18px;
          margin-bottom: 16px;
          border-radius: 14px;
          border: 1px solid #cbd5e1;
          font-size: 16px;
          outline: none;
          background: #f8fafc;
          box-sizing: border-box;
        }

        .login-right button {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #22c55e 0%, #2563eb 100%);
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 8px;
        }

        .bottom-text {
          margin-top: 20px;
          text-align: center;
          color: #475569;
          font-size: 15px;
        }

        .bottom-text a {
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .login-page {
            padding: 14px;
          }

          .login-card {
            grid-template-columns: 1fr;
            min-height: auto;
            border-radius: 20px;
          }

          .login-left {
            padding: 24px 20px;
          }

          .login-left h1 {
            font-size: 32px;
          }

          .login-left p {
            font-size: 15px;
            line-height: 1.6;
          }

          .login-right {
            padding: 24px 20px 28px;
          }

          .login-right h2 {
            font-size: 28px;
            margin-bottom: 18px;
          }

          .login-right input {
            padding: 14px 16px;
            font-size: 15px;
          }

          .login-right button {
            padding: 14px;
            font-size: 15px;
          }
        }
      `}</style>
        </>
    );
}