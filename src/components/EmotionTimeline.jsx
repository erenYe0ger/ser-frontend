// src/components/EmotionTimeline.jsx

import { useState, useRef, useEffect } from "react";
import {
    ComposedChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
} from "recharts";
import { Play, Pause } from "lucide-react";

// 1. Exact Emotion Color Map
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

// Declared outside of render to prevent state resetting and clear ESLint errors
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div
                style={{
                    background: "#18181b",
                    border: "1px solid #27272a",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                }}
            >
                <div style={{ fontWeight: 600 }}>
                    {String(data.emotion).charAt(0).toUpperCase() +
                        String(data.emotion).slice(1)}
                </div>
                <div style={{ color: "#a1a1aa" }}>
                    Confidence: {(data.confidence * 100).toFixed(1)}%
                </div>
                <div style={{ color: "#a1a1aa", fontSize: "0.75rem" }}>
                    Time: {data.time.toFixed(1)}s
                </div>
            </div>
        );
    }
    return null;
};

export default function EmotionTimeline({ timelineData = [], audioUrl }) {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    // Capitalize helpers
    const capitalize = (str) =>
        String(str).charAt(0).toUpperCase() + String(str).slice(1);

    // Time Formatter helper (MM:SS)
    const formatTime = (seconds) => {
        if (isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // 2. Transform timelineData for Recharts
    const chartData = [];
    timelineData.forEach((seg) => {
        chartData.push({
            time: Number(seg.start_time),
            confidence: Number(seg.confidence),
            emotion: seg.emotion,
        });
        chartData.push({
            time: Number(seg.end_time),
            confidence: Number(seg.confidence),
            emotion: seg.emotion,
        });
    });
    // Ensure chronologically sorted data points
    chartData.sort((a, b) => a.time - b.time);

    // Extract all unique emotions present in the current dataset
    const uniqueEmotions = [...new Set(timelineData.map((seg) => seg.emotion))];

    // Audio Playback Event Handlers
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current
                .play()
                .catch((err) => console.error("Playback failed:", err));
        }
    };

    const handleSeek = (e) => {
        if (!audioRef.current || duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);

        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
        };
    }, []);

    return (
        <div
            style={{
                background: "#0f0f0f",
                color: "#ffffff",
                fontFamily: "Inter, system-ui, sans-serif",
                padding: "1.5rem",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                width: "100%",
                boxSizing: "border-box",
            }}
        >
            {/* 3. Recharts Composed Chart Block */}
            <div
                style={{ width: "100%", height: "220px", position: "relative" }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 10, bottom: 5, left: -10 }}
                    >
                        <XAxis
                            dataKey="time"
                            type="number"
                            domain={[0, duration || "dataMax"]}
                            stroke="#52525b"
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                            label={{
                                value: "Time (s)",
                                position: "insideBottomRight",
                                offset: -5,
                                fill: "#a1a1aa",
                                fontSize: 11,
                            }}
                        />
                        <YAxis
                            domain={[0, 1]}
                            stroke="#52525b"
                            tick={{ fill: "#a1a1aa", fontSize: 11 }}
                            label={{
                                value: "Confidence",
                                angle: -90,
                                position: "insideLeft",
                                fill: "#a1a1aa",
                                fontSize: 11,
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Dynamic Rendering of Area Blocks per Emotion */}
                        {uniqueEmotions.map((emo) => (
                            <Area
                                key={emo}
                                type="stepAfter"
                                dataKey={(point) =>
                                    point.emotion === emo ? point.confidence : 0
                                }
                                stroke={EMOTION_COLORS[emo] || "#6b7280"}
                                fill={EMOTION_COLORS[emo] || "#6b7280"}
                                fillOpacity={0.3}
                                connectNulls={false}
                                activeDot={{ r: 4 }}
                            />
                        ))}

                        {/* Playback Position Tracking Reference Line */}
                        <ReferenceLine
                            x={currentTime}
                            stroke="#ffffff"
                            strokeDasharray="4 4"
                            isFront={true}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* 4. Custom Dark Audio Player Section */}
            <div
                style={{
                    background: "#18181b",
                    border: "1px solid #27272a",
                    padding: "1rem",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                />

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                    }}
                >
                    {/* Play/Pause Action Controller */}
                    <button
                        onClick={togglePlay}
                        style={{
                            background: "#ffffff",
                            color: "#0f0f0f",
                            border: "none",
                            borderRadius: "50%",
                            width: "36px",
                            height: "36px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            transition: "transform 0.1s ease",
                        }}
                    >
                        {isPlaying ? (
                            <Pause size={18} fill="#0f0f0f" />
                        ) : (
                            <Play
                                size={18}
                                fill="#0f0f0f"
                                style={{ marginLeft: "2px" }}
                            />
                        )}
                    </button>

                    {/* Time Marker Elements */}
                    <div
                        style={{
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            color: "#e4e4e7",
                            minWidth: "85px",
                        }}
                    >
                        {formatTime(currentTime)}{" "}
                        <span style={{ color: "#52525b" }}>/</span>{" "}
                        {formatTime(duration)}
                    </div>

                    {/* Progress Seek Bar Bar Layer with Simulated Waveform CSS/SVG pattern Background */}
                    <div
                        onClick={handleSeek}
                        style={{
                            flex: 1,
                            height: "40px",
                            background: "#09090b",
                            borderRadius: "6px",
                            position: "relative",
                            cursor: "pointer",
                            overflow: "hidden",
                            border: "1px solid #27272a",
                            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='6' height='40'><rect x='2' y='8' width='2' height='24' fill='%233f3f46'/></svg>")`,
                            backgroundRepeat: "repeat-x",
                        }}
                    >
                        {/* Active Playback Tracker Mask overlay */}
                        <div
                            style={{
                                position: "absolute",
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                                background: "rgba(255, 255, 255, 0.12)",
                                borderRight: "2px solid #ffffff",
                                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='6' height='40'><rect x='2' y='8' width='2' height='24' fill='%23ffffff'/></svg>")`,
                                backgroundRepeat: "repeat-x",
                                pointerEvents: "none",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* 5. Audio Emotion Segment Micro Pills Footer display */}
            <div
                style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    paddingTop: "0.5rem",
                }}
            >
                {timelineData.map((seg, idx) => {
                    const start = Number(seg.start_time);
                    const end = Number(seg.end_time);
                    const isActive = currentTime >= start && currentTime <= end;
                    const targetColor =
                        EMOTION_COLORS[seg.emotion] || "#6b7280";

                    return (
                        <div
                            key={idx}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                background: isActive
                                    ? "rgba(255,255,255,0.07)"
                                    : "#141416",
                                border: isActive
                                    ? `1px solid ${targetColor}`
                                    : "1px solid #242427",
                                padding: "0.4rem 0.8rem",
                                borderRadius: "100px",
                                fontSize: "0.8rem",
                                color: isActive ? "#ffffff" : "#a1a1aa",
                                fontWeight: isActive ? "600" : "400",
                                transition: "all 0.2s ease",
                                boxShadow: isActive
                                    ? `0 0 12px ${targetColor}33`
                                    : "none",
                            }}
                        >
                            {/* Dynamic Emotion Colored Indicator Dot */}
                            <span
                                style={{
                                    width: "7px",
                                    height: "7px",
                                    borderRadius: "50%",
                                    background: targetColor,
                                    display: "inline-block",
                                }}
                            />
                            <span>{capitalize(seg.emotion)}</span>
                            <span style={{ color: "#52525b" }}>•</span>
                            <span>
                                {start.toFixed(1)}s – {end.toFixed(1)}s
                            </span>
                            <span style={{ color: "#52525b" }}>•</span>
                            <span style={{ opacity: 0.85 }}>
                                {(Number(seg.confidence) * 100).toFixed(0)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}