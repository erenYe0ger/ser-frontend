// src/pages/LandingPage.jsx

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

export default function LandingPage({ onGoogleLogin, onGuestLogin }) {
    const [googleHover, setGoogleHover] = useState(false);
    const [guestHover, setGuestHover] = useState(false);

    const features = [
        {
            icon: "🎙️",
            title: "Real-time Analysis",
            description:
                "Analyze speech emotions instantly with AI-powered processing.",
        },
        {
            icon: "🧠",
            title: "Deep Learning Model",
            description:
                "Advanced neural networks trained for accurate emotion detection.",
        },
        {
            icon: "🔒",
            title: "Private & Secure",
            description:
                "Your audio is processed securely with privacy-first design.",
        },
    ];

    const steps = ["1. Sign in", "2. Upload Audio", "3. Get Results"];

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(180deg, #0f0f0f 0%, #111827 100%)",
                color: "white",
                fontFamily:
                    "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
        >
            {/* Hero Section */}
            <section
                style={{
                    minHeight: "75vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "clamp(1rem, 4vw, 2rem)",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        width: "min(500px, 90vw)",
                        height: "min(500px, 90vw)",
                        background:
                            "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
                        filter: "blur(80px)",
                        zIndex: 0,
                    }}
                />

                <div
                    style={{
                        position: "relative",
                        zIndex: 1,
                        maxWidth: "900px",
                        width: "100%",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "clamp(3rem, 8vw, 5rem)",
                            fontWeight: 800,
                            marginBottom: "1.25rem",
                            lineHeight: 1.05,
                            paddingBottom: "1rem",
                            background:
                                "linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #6366f1 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Speech Emotion Recognition
                    </h1>

                    <p
                        style={{
                            fontSize: "clamp(1rem, 3vw, 1.25rem)",
                            color: "#d1d5db",
                            maxWidth: "700px",
                            width: "100%",
                            margin: "0 auto 2.5rem auto",
                            lineHeight: 1.7,
                        }}
                    >
                        Understand the emotion behind every voice using AI.
                        Upload speech recordings and receive intelligent emotion
                        analysis powered by deep learning.
                    </p>

                    <div
                        style={{
                            display: "flex",
                            gap: "1rem",
                            justifyContent: "center",
                            alignItems: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <div
                            style={{
                                transform: googleHover
                                    ? "translateY(-3px)"
                                    : "translateY(0)",
                                transition: "all 0.25s ease",
                                boxShadow: googleHover
                                    ? "0 15px 35px rgba(255,255,255,0.15)"
                                    : "0 10px 25px rgba(255,255,255,0.08)",
                                borderRadius: "12px",
                            }}
                            onMouseEnter={() => setGoogleHover(true)}
                            onMouseLeave={() => setGoogleHover(false)}
                        >
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    onGoogleLogin(credentialResponse);
                                }}
                                onError={() => {
                                    console.error("Google Login Failed");
                                }}
                            />
                        </div>

                        <button
                            onClick={onGuestLogin}
                            onMouseEnter={() => setGuestHover(true)}
                            onMouseLeave={() => setGuestHover(false)}
                            style={{
                                background: guestHover
                                    ? "#6366f1"
                                    : "transparent",
                                color: "white",
                                border: "1px solid #6366f1",
                                padding: "0.95rem 1.75rem",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontSize: "1rem",
                                fontWeight: 600,
                                transition: "all 0.25s ease",
                                transform: guestHover
                                    ? "translateY(-3px)"
                                    : "translateY(0)",
                                boxShadow: guestHover
                                    ? "0 15px 35px rgba(99,102,241,0.35)"
                                    : "none",
                            }}
                        >
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section
                style={{
                    padding: "clamp(3rem, 8vw, 5rem) clamp(1rem, 4vw, 2rem)",
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        fontSize: "2.2rem",
                        marginBottom: "3rem",
                        fontWeight: 800,
                        color: "#ffffff",
                        textShadow: "0 0 20px rgba(99,102,241,0.35)",
                    }}
                >
                    Features
                </h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "1.5rem",
                    }}
                >
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            style={{
                                background:
                                    "linear-gradient(180deg, #18181b 0%, #131316 100%)",
                                border: "1px solid #27272a",
                                borderRadius: "20px",
                                padding: "2rem",
                                boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "2.75rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                {feature.icon}
                            </div>

                            <h3
                                style={{
                                    fontSize: "1.2rem",
                                    marginBottom: "0.75rem",
                                    color: "#ffffff",
                                }}
                            >
                                {feature.title}
                            </h3>

                            <p
                                style={{
                                    color: "#a1a1aa",
                                    lineHeight: 1.7,
                                }}
                            >
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section
                style={{
                    padding:
                        "clamp(3rem, 8vw, 4rem) clamp(1rem, 4vw, 2rem) 6rem",
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                <h2
                    style={{
                        textAlign: "center",
                        fontSize: "2.2rem",
                        marginBottom: "3rem",
                        fontWeight: 800,
                        color: "#ffffff",
                        textShadow: "0 0 20px rgba(99,102,241,0.35)",
                    }}
                >
                    How It Works
                </h2>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "1.5rem",
                        flexWrap: "wrap",
                    }}
                >
                    {steps.map((step) => (
                        <div
                            key={step}
                            style={{
                                width: "100%",
                                maxWidth: "320px",
                                padding: "1.5rem 2rem",
                                textAlign: "center",
                                background:
                                    "linear-gradient(180deg, #18181b 0%, #131316 100%)",
                                border: "1px solid #27272a",
                                borderRadius: "18px",
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
                            }}
                        >
                            {step}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
