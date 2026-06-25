// src/pages/HistoryPage.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { Lock, Loader2, BarChart2 } from "lucide-react";
import EmotionTimeline from "../components/EmotionTimeline";

// Shared Emotion Color Mapping
const EMOTION_COLORS = {
    angry: "#ef4444",
    happy: "#f59e0b",
    sad: "#3b82f6",
    neutral: "#6b7280",
    fearful: "#8b5cf6",
    disgusted: "#10b981",
    surprised: "#ec4899",
    calm: "#06b6d4",
};

export default function HistoryPage({ token, user }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(() => !user || user.user_type === "guest" ? false : true);
    const [error, setError] = useState("");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    // Format utility for IST timestamps
    const formatISTDate = (dateString) => {
        try {
            // Backend returns UTC but without timezone info, so treat it as UTC
            const utcDate = new Date(dateString + "Z");

            // Add 5 hours 30 minutes
            utcDate.setMinutes(utcDate.getMinutes() + 330);

            return (
                utcDate.toLocaleString("en-IN", {
                    timeZone: "UTC",
                    dateStyle: "medium",
                    timeStyle: "short",
                }) + " IST"
            );
        } catch {
            return dateString;
        }
    };

    const capitalize = (str) =>
        String(str).charAt(0).toUpperCase() + String(str).slice(1);

    useEffect(() => {
        // Explicit early return for Guest access types without firing API queries
        if (!user || user.user_type === "guest") {
            return;
        }

        const fetchHistory = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await axios.get(`${API_URL}/api/v1/history`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setHistory(response.data || []);
            } catch (err) {
                setError(
                    err?.response?.data?.detail ||
                        "Failed to load analysis history. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [token, user, API_URL]);

    // UI View Wrapper Style Helper
    const centeredWrapperStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        gap: "1rem",
        color: "#a1a1aa",
        padding: "2rem",
    };

    // 1. Conditional Guard View: Guest Mode Restrictions
    if (user?.user_type === "guest") {
        return (
            <div style={centeredWrapperStyle}>
                <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "1rem", borderRadius: "50%", display: "flex" }}>
                    <Lock size={32} color="#ef4444" />
                </div>
                <h3 style={{ color: "#ffffff", margin: "0.5rem 0 0 0", fontSize: "1.25rem" }}>
                    Access Restricted
                </h3>
                <p style={{ margin: 0 }}>Please login to save your analyses</p>
            </div>
        );
    }

    // 2. Conditional State View: Data Loading Spinner
    if (loading) {
        return (
            <div style={centeredWrapperStyle}>
                <Loader2 size={36} color="#6366f1" className="spin-animation" style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ margin: 0 }}>Retrieving your logs...</p>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // 3. Conditional State View: Error Notification Alert Box
    if (error) {
        return (
            <div style={centeredWrapperStyle}>
                <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#f87171", padding: "1rem 1.5rem", borderRadius: "12px", maxWidth: "500px" }}>
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    // 4. Conditional State View: Empty Dataset Placeholder Message
    if (history.length === 0) {
        return (
            <div style={centeredWrapperStyle}>
                <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1rem", borderRadius: "50%", display: "flex" }}>
                    <BarChart2 size={32} color="#52525b" />
                </div>
                <h3 style={{ color: "#ffffff", margin: "0.5rem 0 0 0", fontSize: "1.25rem" }}>
                    No analyses yet
                </h3>
                <p style={{ margin: 0 }}>Go to Analyse to get started.</p>
            </div>
        );
    }

    // 5. Default Primary Data Content Render Node (Dark Theme Context Layout)
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#0f0f0f",
                color: "#ffffff",
                fontFamily: "Inter, system-ui, sans-serif",
                padding: "2rem 1rem",
                maxWidth: "800px",
                margin: "0 auto",
                boxSizing: "border-box",
            }}
        >
            <h1 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "2rem" }}>
                Analysis History
            </h1>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {history.map((item, index) => {
                    const targetColor = EMOTION_COLORS[item.emotion] || "#6b7280";
                    const hasTimeline = item.timeline_data && item.timeline_data.length > 0 && item.audio_url;

                    return (
                        <div key={item.id || index} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {/* Card Entry Node Wrapper Context block */}
                            <div
                                style={{
                                    background: "#141416",
                                    border: "1px solid #232326",
                                    borderRadius: "16px",
                                    padding: "1.5rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1.25rem",
                                }}
                            >
                                {/* Row Header Details Area block */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "flex-start",
                                        gap: "1rem",
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontWeight: "600",
                                            fontSize: "1.05rem",
                                            color: "#f4f4f5",
                                            wordBreak: "break-all",
                                            flex: 1,
                                        }}
                                    >
                                        {item.audio_filename || "audio_recording.wav"}
                                    </span>
                                    <span style={{ fontSize: "0.85rem", color: "#71717a", whiteSpace: "nowrap" }}>
                                        {formatISTDate(item.created_at)}
                                    </span>
                                </div>

                                {/* Row Summary Result details container block */}
                                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span
                                            style={{
                                                width: "8px",
                                                height: "8px",
                                                borderRadius: "50%",
                                                backgroundColor: targetColor,
                                                display: "inline-block",
                                            }}
                                        />
                                        <span style={{ fontWeight: "700", color: "#ffffff", fontSize: "1.1rem" }}>
                                            {capitalize(item.emotion)}
                                        </span>
                                    </div>

                                    <div style={{ fontSize: "0.95rem", color: "#a1a1aa" }}>
                                        Confidence:{" "}
                                        <strong style={{ color: "#ffffff" }}>
                                            {(Number(item.confidence) * 100).toFixed(1)}%
                                        </strong>
                                    </div>
                                </div>

                                {/* Conditional Render Embed Block: Timeline Component vs Subtle Text Element */}
                                {hasTimeline ? (
                                    <div style={{ marginTop: "0.5rem", width: "100%" }}>
                                        <EmotionTimeline
                                            timelineData={item.timeline_data}
                                            audioUrl={item.audio_url}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            fontSize: "0.85rem",
                                            color: "#3f3f46",
                                            fontStyle: "italic",
                                            paddingTop: "0.5rem",
                                            borderTop: "1px dashed #232326",
                                        }}
                                    >
                                        No timeline data available for this session
                                    </div>
                                )}
                            </div>

                            {/* Separator Element displayed between map index items */}
                            {index < history.length - 1 && (
                                <hr
                                    style={{
                                        border: "none",
                                        height: "1px",
                                        backgroundColor: "#1f1f23",
                                        margin: "0.5rem 0",
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}