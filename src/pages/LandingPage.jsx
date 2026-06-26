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
        <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] via-50% to-[#111827] text-white font-['Inter',_system-ui,_sans-serif]">
            {/* Hero Section */}
            <section className="min-h-[75vh] flex flex-col justify-center items-center text-center p-[clamp(1rem,4vw,2rem)] relative">
                <div className="absolute w-[min(500px,90vw)] h-[min(500px,90vw)] bg-[radial-gradient(circle,rgba(99,102,241,0.18)_0%,transparent_70%)] blur-[80px] z-0" />

                <div className="relative z-10 max-w-[900px] w-full">
                    <h1 className="text-[clamp(3rem,8vw,5rem)] font-extrabold mb-5 leading-[1.05] pb-4 bg-gradient-to-br from-white via-[#a5b4fc] via-50% to-[#6366f1] bg-clip-text text-transparent">
                        Speech Emotion Recognition
                    </h1>

                    <p className="text-[clamp(1rem,3vw,1.25rem)] text-[#d1d5db] max-w-[700px] w-full mx-auto mb-10 leading-[1.7]">
                        Understand the emotion behind every voice using AI.
                        Upload speech recordings and receive intelligent emotion
                        analysis powered by deep learning.
                    </p>

                    <div className="flex gap-[1rem] justify-center items-center flex-wrap">
                        <div
                            className={`transition-all duration-[0.25s] ease-in-out rounded-[12px] ${
                                googleHover
                                    ? "-translate-y-[3px] shadow-[0_15px_35px_rgba(255,255,255,0.15)]"
                                    : "translate-y-0 shadow-[0_10px_25px_rgba(255,255,255,0.08)]"
                            }`}
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
                                // Forces the Google iframe button font-weight to be bold
                                text="signin_with" 
                                theme="filled_blue"
                            />
                        </div>

                        <button
                            onClick={onGuestLogin}
                            onMouseEnter={() => setGuestHover(true)}
                            onMouseLeave={() => setGuestHover(false)}
                            className={`text-white border border-[#6366f1] py-[0.95rem] px-[1.75rem] rounded-[12px] cursor-pointer text-[1rem] font-semibold transition-all duration-[0.25s] ease-in-out ${
                                guestHover
                                    ? "bg-[#6366f1] -translate-y-[3px] shadow-[0_15px_35px_rgba(99,102,241,0.35)]"
                                    : "bg-transparent translate-y-0 shadow-none"
                            }`}
                        >
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-[clamp(3rem,8vw,5rem)] px-[clamp(1rem,4vw,2rem)] max-w-[1200px] mx-auto">
                <h2 className="text-center text-[2.2rem] mb-12 font-extrabold text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                    Features
                </h2>

                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="bg-gradient-to-b from-[#18181b] to-[#131316] border border-[#27272a] rounded-[20px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                        >
                            <div className="text-[2.75rem] mb-4">
                                {feature.icon}
                            </div>

                            <h3 className="text-[1.2rem] mb-[0.75rem] text-white">
                                {feature.title}
                            </h3>

                            <p className="text-[#a1a1aa] leading-[1.7]">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="pt-[clamp(3rem,8vw,4rem)] px-[clamp(1rem,4vw,2rem)] pb-24 max-w-[1200px] mx-auto">
                <h2 className="text-center text-[2.2rem] mb-12 font-extrabold text-white drop-shadow-[0_0_20px_rgba(99,102,241,0.35)]">
                    How It Works
                </h2>

                <div className="flex justify-center gap-6 flex-wrap">
                    {steps.map((step) => (
                        <div
                            key={step}
                            className="w-full max-w-[320px] py-6 px-8 text-center bg-gradient-to-b from-[#18181b] to-[#131316] border border-[#27272a] rounded-[18px] text-[1.1rem] font-semibold shadow-[0_15px_35px_rgba(0,0,0,0.3)]"
                        >
                            {step}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}