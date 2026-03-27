"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSignup = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            const res = await fetch(`${apiUrl}/api/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Signup success");
                window.location.href = "/login";
            } else {
                alert(data.message || "Signup failed");
            }
        } catch (err) {
            console.error("SIGNUP ERROR:", err);
            alert("Error connecting server");
        }
    };

    return (
        <>
            <div className="signup-page">
                <div className="signup-card">
                    <div className="signup-left">
                        <h1>Create Account</h1>
                        <p>
                            Join BanglaDoc AI and manage your Bangla documents with a faster
                            workflow.
                        </p>
                    </div>

                    <div className="signup-right">
                        <h2>Sign Up</h2>

                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

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

                        <button onClick={handleSignup}>Create Account</button>

                        <p className="bottom-text">
                            Already have an account? <Link href="/login">Login</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .signup-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%);
        }

        .signup-card {
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

        .signup-left {
          padding: 56px;
          color: #ffffff;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .signup-left h1 {
          font-size: 44px;
          line-height: 1.1;
          margin: 0 0 16px 0;
        }

        .signup-left p {
          font-size: 18px;
          line-height: 1.7;
          margin: 0;
          opacity: 0.95;
        }

        .signup-right {
          padding: 56px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #ffffff;
        }

        .signup-right h2 {
          font-size: 34px;
          margin: 0 0 24px 0;
          color: #0f172a;
        }

        .signup-right input {
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

        .signup-right button {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
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
          .signup-page {
            padding: 14px;
          }

          .signup-card {
            grid-template-columns: 1fr;
            min-height: auto;
            border-radius: 20px;
          }

          .signup-left {
            padding: 24px 20px;
          }

          .signup-left h1 {
            font-size: 32px;
          }

          .signup-left p {
            font-size: 15px;
            line-height: 1.6;
          }

          .signup-right {
            padding: 24px 20px 28px;
          }

          .signup-right h2 {
            font-size: 28px;
            margin-bottom: 18px;
          }

          .signup-right input {
            padding: 14px 16px;
            font-size: 15px;
          }

          .signup-right button {
            padding: 14px;
            font-size: 15px;
          }
        }
      `}</style>
        </>
    );
}