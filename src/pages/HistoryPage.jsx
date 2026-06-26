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

    // UI View Wrapper Style Helper Class String
    const centeredWrapperClass = "flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 text-[#a1a1aa] p-8";

    // 1. Conditional Guard View: Guest Mode Restrictions
    if (user?.user_type === "guest") {
        return (
            <div className={centeredWrapperClass}>
                <div className="bg-red-500/10 p-4 rounded-full flex">
                    <Lock size={32} color="#ef4444" />
                </div>
                <h3 className="text-white mt-2 mb-0 text-xl">
                    Access Restricted
                </h3>
                <p className="m-0">Please login to save your analyses</p>
            </div>
        );
    }

    // 2. Conditional State View: Data Loading Spinner
    if (loading) {
        return (
            <div className={centeredWrapperClass}>
                <Loader2 size={36} color="#6366f1" className="animate-spin" />
                <p className="m-0">Retrieving your logs...</p>
            </div>
        );
    }

    // 3. Conditional State View: Error Notification Alert Box
    if (error) {
        return (
            <div className={centeredWrapperClass}>
                <div className="bg-red-500/[0.08] border border-red-500/20 text-[#f87171] py-4 px-6 rounded-xl max-w-[500px]">
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    // 4. Conditional State View: Empty Dataset Placeholder Message
    if (history.length === 0) {
        return (
            <div className={centeredWrapperClass}>
                <div className="bg-white/[0.03] p-4 rounded-full flex">
                    <BarChart2 size={32} color="#52525b" />
                </div>
                <h3 className="text-white mt-2 mb-0 text-xl">
                    No analyses yet
                </h3>
                <p className="m-0">Go to Analyse to get started.</p>
            </div>
        );
    }

    // 5. Default Primary Data Content Render Node (Dark Theme Context Layout)
    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white font-sans py-8 px-4 max-w-[800px] mx-auto box-border">
            <h1 className="text-[1.75rem] font-bold mb-8">
                Analysis History
            </h1>

            <div className="flex flex-col gap-8">
                {history.map((item, index) => {
                    const targetColor = EMOTION_COLORS[item.emotion] || "#6b7280";
                    const hasTimeline = item.timeline_data && item.timeline_data.length > 0 && item.audio_url;

                    return (
                        <div key={item.id || index} className="flex flex-col gap-4">
                            {/* Card Entry Node Wrapper Context block */}
                            <div className="bg-[#141416] border border-[#232326] rounded-2xl p-6 flex flex-col gap-5">
                                {/* Row Header Details Area block */}
                                <div className="flex justify-between items-start gap-4 flex-wrap">
                                    <span className="font-semibold text-[1.05rem] text-[#f4f4f5] break-all flex-1">
                                        {item.audio_filename || "audio_recording.wav"}
                                    </span>
                                    <span className="text-[0.85rem] text-[#71717a] whitespace-nowrap">
                                        {formatISTDate(item.created_at)}
                                    </span>
                                </div>

                                {/* Row Summary Result details container block */}
                                <div className="flex items-center gap-6 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <span
                                            style={{
                                                width: "8px",
                                                height: "8px",
                                                borderRadius: "50%",
                                                backgroundColor: targetColor,
                                                display: "inline-block",
                                            }}
                                        />
                                        <span className="font-bold text-white text-[1.1rem]">
                                            {capitalize(item.emotion)}
                                        </span>
                                    </div>

                                    <div className="text-[0.95rem] text-[#a1a1aa]">
                                        Confidence:{" "}
                                        <strong className="text-white">
                                            {(Number(item.confidence) * 100).toFixed(1)}%
                                        </strong>
                                    </div>
                                </div>

                                {/* Conditional Render Embed Block: Timeline Component vs Subtle Text Element */}
                                {hasTimeline ? (
                                    <div className="mt-2 w-full">
                                        <EmotionTimeline
                                            timelineData={item.timeline_data}
                                            audioUrl={item.audio_url}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-[0.85rem] text-[#3f3f46] italic pt-2 border-t border-dashed border-[#232326]">
                                        No timeline data available for this session
                                    </div>
                                )}
                            </div>

                            {/* Separator Element displayed between map index items */}
                            {index < history.length - 1 && (
                                <hr className="border-none h-[1px] bg-[#1f1f23] my-2" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}