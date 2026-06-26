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
            <div className="bg-[#18181b] border border-[#27272a] p-2 rounded-lg text-white text-[0.85rem]">
                <div className="font-semibold">
                    {String(data.emotion).charAt(0).toUpperCase() +
                        String(data.emotion).slice(1)}
                </div>
                <div className="text-[#a1a1aa]">
                    Confidence: {(data.confidence * 100).toFixed(1)}%
                </div>
                <div className="text-[#a1a1aa] text-[0.75rem]">
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
        <div className="bg-[#0f0f0f] text-white font-sans p-6 rounded-2xl flex flex-col gap-6 w-full box-border">
            {/* 3. Recharts Composed Chart Block */}
            <div className="w-full h-[220px] relative">
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
            <div className="bg-[#18181b] border border-[#27272a] p-4 rounded-xl flex flex-col gap-4">
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                />

                <div className="flex items-center gap-4">
                    {/* Play/Pause Action Controller */}
                    <button
                        onClick={togglePlay}
                        className="bg-white text-[#0f0f0f] border-none rounded-full w-9 h-9 flex items-center justify-center cursor-pointer transition-transform duration-100 ease-out"
                    >
                        {isPlaying ? (
                            <Pause size={18} fill="#0f0f0f" />
                        ) : (
                            <Play
                                size={18}
                                fill="#0f0f0f"
                                className="ml-0.5"
                            />
                        )}
                    </button>

                    {/* Time Marker Elements */}
                    <div className="text-[0.85rem] font-medium text-[#e4e4e7] min-w-[85px]">
                        {formatTime(currentTime)}{" "}
                        <span className="text-[#52525b]">/</span>{" "}
                        {formatTime(duration)}
                    </div>

                    {/* Progress Seek Bar Bar Layer with Simulated Waveform Background */}
                    <div
                        onClick={handleSeek}
                        className="flex-1 h-10 bg-[#09090b] rounded-md relative cursor-pointer overflow-hidden border border-[#27272a]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='6' height='40'><rect x='2' y='8' width='2' height='24' fill='%233f3f46'/></svg>")`,
                            backgroundRepeat: "repeat-x",
                        }}
                    >
                        {/* Active Playback Tracker Mask overlay */}
                        <div
                            className="absolute left-0 top-0 bottom-0 border-r-2 border-white pointer-events-none"
                            style={{
                                width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                                background: "rgba(255, 255, 255, 0.12)",
                                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='6' height='40'><rect x='2' y='8' width='2' height='24' fill='%23ffffff'/></svg>")`,
                                backgroundRepeat: "repeat-x",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* 5. Audio Emotion Segment Micro Pills Footer display */}
            <div className="flex gap-3 flex-wrap pt-2">
                {timelineData.map((seg, idx) => {
                    const start = Number(seg.start_time);
                    const end = Number(seg.end_time);
                    const isActive = currentTime >= start && currentTime <= end;
                    const targetColor =
                        EMOTION_COLORS[seg.emotion] || "#6b7280";

                    return (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.8rem] transition-all duration-200 ${
                                isActive
                                    ? "bg-white/5 text-white font-semibold"
                                    : "bg-[#141416] border border-[#242427] text-[#a1a1aa] font-normal"
                            }`}
                            style={{
                                border: isActive ? `1px solid ${targetColor}` : undefined,
                                boxShadow: isActive ? `0 0 12px ${targetColor}33` : "none",
                            }}
                        >
                            {/* Dynamic Emotion Colored Indicator Dot */}
                            <span
                                className="w-1.5 h-1.5 rounded-full inline-block"
                                style={{ background: targetColor }}
                            />
                            <span>{capitalize(seg.emotion)}</span>
                            <span className="text-[#52525b]">•</span>
                            <span>
                                {start.toFixed(1)}s – {end.toFixed(1)}s
                            </span>
                            <span className="text-[#52525b]">•</span>
                            <span className="opacity-85">
                                {(Number(seg.confidence) * 100).toFixed(0)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}