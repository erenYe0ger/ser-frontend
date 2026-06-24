// src/pages/AppPage.jsx

import { useState } from "react";
import axios from "axios";
import "../App.css";

function AppPage({ token, user, profile, onLogout }) {
    // State for the selected audio file
    const [file, setFile] = useState(null);

    // State for the prediction result
    const [result, setResult] = useState(null);

    // State for loading indicator
    const [loading, setLoading] = useState(false);

    // State for error messages
    const [error, setError] = useState("");

    // State for prediction history
    const [history, setHistory] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleUnauthorized = (err) => {
        if (err?.response?.status === 401) {
            onLogout();
            return true;
        }
        return false;
    };

    // Handle audio analysis request
    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await axios.post(
                `${API_URL}/api/v1/predict`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            setResult(response.data);
        } catch (err) {
            if (handleUnauthorized(err)) return;

            setError(
                err?.response?.data?.detail ||
                    "Failed to analyze audio. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    // Load prediction history from the backend
    const loadHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/history`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setHistory(response.data);
        } catch (err) {
            if (handleUnauthorized(err)) return;

            setError(err?.response?.data?.detail || "Failed to load history.");
        }
    };

    const userLabel =
        user?.user_type === "guest"
            ? "Guest"
            : profile?.name || profile?.email || "User";

    const formatISTDate = (dateString) => {
        const utcDate = new Date(dateString);

        // Convert UTC -> IST
        const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

        const day = istDate.getDate();

        const getOrdinal = (d) => {
            if (d > 3 && d < 21) return "th";
            switch (d % 10) {
                case 1:
                    return "st";
                case 2:
                    return "nd";
                case 3:
                    return "rd";
                default:
                    return "th";
            }
        };

        const datePart = `${day}${getOrdinal(day)} ${istDate.toLocaleString(
            "en-US",
            {
                month: "long",
                year: "numeric",
            },
        )}`;

        const timePart = istDate.toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });

        return `${datePart} • ${timePart} IST`;
    };

    return (
        <div className="app">
            {/* Navbar */}
            <nav
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid #333",
                }}
            >
                <h2
                    style={{
                        margin: 0,
                    }}
                >
                    Speech Emotion Recognition
                </h2>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    <span style={{ fontWeight: "bold" }}>{userLabel}</span>

                    <button className="btn" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Audio Upload Section */}
            <section
                className="card"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "1.25rem", // Adds clean vertical space between box and button
                }}
            >
                <div
                    style={{
                        maxWidth: "400px", // Shortens the dotted upload box area
                        width: "100%",
                        display: "flex",
                    }}
                >
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        style={{
                            width: "100%",
                        }}
                    />
                </div>

                <button
                    className="btn"
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                >
                    {loading ? "Analyzing..." : "Analyze"}
                </button>
            </section>

            {/* Error Display Section */}
            {error && (
                <section className="error-box">
                    <strong>Error:</strong> {error}
                </section>
            )}

            {/* Prediction Result Section */}
            {result && (
                <section className="card">
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap",
                            marginBottom: "1rem",
                        }}
                    >
                        <h2 style={{ margin: 0 }}>Prediction Result</h2>

                        <span className="badge">
                            {result.source === "cache"
                                ? "FROM CACHE"
                                : "FROM MODEL"}
                        </span>
                    </div>

                    {/* Main Result */}
                    <div
                        style={{
                            marginBottom: "1.25rem",
                        }}
                    >
                        <h1
                            style={{
                                margin: 0,
                                lineHeight: 1.1,
                            }}
                        >
                            {String(result.emotion).charAt(0).toUpperCase() +
                                String(result.emotion).slice(1)}
                        </h1>

                        <div
                            style={{
                                marginTop: "0.35rem",
                            }}
                        >
                            Confidence:{" "}
                            <strong>
                                {(Number(result.confidence) * 100).toFixed(1)}%
                            </strong>
                        </div>
                    </div>

                    {/* Emotion Probabilities */}
                    {result.all_emotions && (
                        <div>
                            <h3
                                style={{
                                    marginTop: "0.75rem",
                                    marginBottom: "0.6rem",
                                }}
                            >
                                Emotion Probabilities
                            </h3>

                            {Object.entries(result.all_emotions).map(
                                ([emotion, value]) => {
                                    const percentage = Number(value) * 100;

                                    return (
                                        <div
                                            key={emotion}
                                            style={{
                                                marginBottom: "0.55rem",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.75rem",
                                                    width: "100%",
                                                }}
                                            >
                                                {/* Emotion Name */}
                                                <span
                                                    style={{
                                                        width: "75px",
                                                        flexShrink: 0,
                                                        fontSize: "0.95rem",
                                                    }}
                                                >
                                                    {emotion
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        emotion.slice(1)}
                                                </span>

                                                {/* Bar */}
                                                <div
                                                    className="bar-track"
                                                    style={{
                                                        flex: 1,
                                                        margin: 0,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <div
                                                        className="bar-fill"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    />
                                                </div>

                                                {/* Percentage */}
                                                <span
                                                    style={{
                                                        width: "55px",
                                                        flexShrink: 0,
                                                        textAlign: "right",
                                                        fontSize: "0.95rem",
                                                    }}
                                                >
                                                    {percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    )}
                </section>
            )}

            {/* Prediction History Section */}
            <section className="card">
                <div>
                    <h2>History</h2>

                    <button className="btn" onClick={loadHistory}>
                        Load History
                    </button>
                </div>

                {history.length > 0 ? (
                    <ul>
                        {history.map((item) => (
                            <li key={item.id} className="history-item">
                                <div>
                                    <strong>
                                        {String(item.emotion)
                                            .charAt(0)
                                            .toUpperCase() +
                                            String(item.emotion).slice(1)}
                                    </strong>
                                </div>

                                <div>
                                    Confidence:{" "}
                                    {(Number(item.confidence) * 100).toFixed(1)}
                                    %
                                </div>

                                <div>
                                    <div>{formatISTDate(item.created_at)}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No history loaded.</p>
                )}
            </section>
        </div>
    );
}

export default AppPage;
