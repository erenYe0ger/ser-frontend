import {
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { Mic } from "lucide-react";
import EmotionTimeline from "../components/EmotionTimeline";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function AnalysePage({ token }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [isRecording, setIsRecording] =
    useState(false);

  const [recordedBlob, setRecordedBlob] =
    useState(null);

  const [recordedUrl, setRecordedUrl] =
    useState(null);

  const [recordingTime, setRecordingTime] =
    useState(0);

  const fileInputRef = useRef(null);

  const mediaRecorderRef = useRef(null);

  const timerRef = useRef(null);

  const chunksRef = useRef([]);

  const resetState = () => {
    setFile(null);
    setResult(null);
    setError(null);

    setRecordedBlob(null);

    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    setRecordedUrl(null);

    setIsRecording(false);

    setRecordingTime(0);

    clearInterval(timerRef.current);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    resetState();
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("audio/")) {
      setError("Please select a valid audio file.");
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (e.dataTransfer.files?.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyse = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(
        `${API_URL}/api/v1/predict/timeline`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to analyse audio."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !==
          "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }

      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  const startRecording = async () => {
    if (isRecording) return;

    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(
          chunksRef.current,
          {
            type: "audio/webm",
          }
        );

        const url =
          URL.createObjectURL(blob);

        setRecordedBlob(blob);
        setRecordedUrl(url);

        chunksRef.current = [];

        stream
          .getTracks()
          .forEach((track) => track.stop());
      };

      setRecordedBlob(null);

      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
        setRecordedUrl(null);
      }

      setRecordingTime(0);
      setIsRecording(true);

      mediaRecorder.start();

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }

          return prev + 1;
        });
      }, 1000);
    } catch {
      setError(
        "Unable to access microphone."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
        "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    clearInterval(timerRef.current);

    setIsRecording(false);
    setRecordingTime(0);
  };

  const discardRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }

    setRecordedBlob(null);
    setRecordedUrl(null);
    setResult(null);
  };

  const submitRecording = async () => {
    if (!recordedBlob) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      const filename = `recording_${Date.now()}.webm`;
      formData.append("file", recordedBlob, filename);

      const { data } = await axios.post(
        `${API_URL}/api/v1/predict/timeline`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setResult(data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to analyse recording."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-[900px] mx-auto">
        <h1 className="m-0 mb-8 text-[2rem] font-bold">
          Analyse Audio
        </h1>

        <div className="flex gap-4 mb-8">
          <button
            className={`p-[0.8rem_1.4rem] rounded-[10px] text-[0.95rem] font-semibold transition-all duration-200 ${
              activeTab === "upload"
                ? "border border-white bg-white text-black"
                : "border border-[#444] bg-transparent text-[#9ca3af]"
            } ${isRecording ? "cursor-not-allowed opacity-50" : "cursor-pointer opacity-100"}`}
            onClick={() => switchTab("upload")}
            disabled={isRecording}
          >
            Upload File
          </button>

          <button
            className={`p-[0.8rem_1.4rem] rounded-[10px] text-[0.95rem] font-semibold transition-all duration-200 ${
              activeTab === "record"
                ? "border border-white bg-white text-black"
                : "border border-[#444] bg-transparent text-[#9ca3af]"
            } ${isRecording ? "cursor-not-allowed opacity-50" : "cursor-pointer opacity-100"}`}
            onClick={() => switchTab("record")}
            disabled={isRecording}
          >
            Record Audio
          </button>
        </div>

        {activeTab === "upload" && (
          <>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-[#333] hover:border-[#6366f1] rounded-[16px] min-h-[240px] flex justify-center items-center text-center cursor-pointer transition-colors duration-200 bg-[#171717] p-8 text-[#d1d5db] text-base"
            >
              <div>
                {file ? (
                  <>
                    <div className="text-[3rem] mb-4">
                      🎵
                    </div>

                    <div className="text-white font-semibold">
                      {file.name}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[3rem] mb-1">
                      📁
                    </div>

                    <div>
                      Drop audio file here or click to browse
                    </div>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            <button
              onClick={handleAnalyse}
              disabled={!file || isLoading}
              className={`w-full mt-6 p-4 text-white border-none rounded-[10px] text-base font-semibold transition-colors duration-200 ${
                !file || isLoading ? "bg-[#3f3f46] cursor-not-allowed" : "bg-[#6366f1] cursor-pointer"
              }`}
            >
              {isLoading ? "Analysing..." : "Analyse"}
            </button>

            {error && (
              <div className="mt-4 text-[#ef4444] bg-[#2b1111] border border-[#7f1d1d] rounded-[10px] p-4">
                {error}
              </div>
            )}
          </>
        )}

        {activeTab === "record" && (
          <div className="min-h-[320px] bg-[#171717] rounded-[16px] border border-[#2d2d2d] p-8 flex flex-col justify-center items-center gap-6">
            {!isRecording &&
              !recordedBlob && (
                <>
                  <Mic
                    size={64}
                    color="#ef4444"
                  />

                  <button
                    onClick={
                      startRecording
                    }
                    className="bg-[#ef4444] text-white border-none p-[1rem_2rem] rounded-[10px] text-base font-semibold cursor-pointer"
                  >
                    Start Recording
                  </button>
                </>
              )}

            {isRecording && (
              <>
                <Mic
                  size={64}
                  color="#ef4444"
                />

                <div className="text-[2rem] font-bold">
                  {String(
                    Math.floor(
                      recordingTime / 60
                    )
                  ).padStart(2, "0")}
                  :
                  {String(
                    recordingTime % 60
                  ).padStart(2, "0")}
                </div>

                <div className="w-full h-1.5 bg-[#333] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ef4444] transition-[width] duration-1000 linear"
                    style={{
                      width: `${
                        (recordingTime /
                          60) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <button
                  onClick={
                    stopRecording
                  }
                  className="bg-[#ef4444] text-white border-none p-[1rem_2rem] rounded-[10px] text-base font-semibold cursor-pointer"
                >
                  Stop Recording
                </button>
              </>
            )}

            {!isRecording &&
              recordedBlob && (
                <>
                  <audio
                    controls
                    src={recordedUrl}
                    className="w-full"
                  />

                  <div className="flex gap-4 w-full">
                    <button
                      onClick={
                        submitRecording
                      }
                      disabled={
                        isLoading
                      }
                      className="flex-1 bg-[#6366f1] text-white border-none p-4 rounded-[10px] font-semibold cursor-pointer"
                    >
                      {isLoading
                        ? "Analysing..."
                        : "Submit"}
                    </button>

                    <button
                      onClick={
                        discardRecording
                      }
                      className="flex-1 bg-transparent text-[#ef4444] border border-[#ef4444] p-4 rounded-[10px] font-semibold cursor-pointer"
                    >
                      Discard
                    </button>
                  </div>
                </>
              )}
          {error && (
            <div className="w-full box-border mt-4 text-[#ef4444] bg-[#2b1111] border border-[#7f1d1d] rounded-[10px] p-4">
              {error}
            </div>
          )}
          </div>
        )}

        {result && (
          <div className="mt-8 flex flex-col gap-6">
            <div className="bg-[#171717] border border-[#2d2d2d] rounded-[16px] p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="m-0 text-[1.2rem]">
                  Overall Result
                </h2>
                {result.source && (
                  <span className="whitespace-pre text-[0.75rem] font-bold tracking-wide px-3 py-1 rounded-full bg-[rgba(99,102,241,0.1)] text-[#38c2cc] border border-[rgba(99,102,241,0.2)]">
                    {result.source === "cache" ? "FROM  CACHE" : "FROM  MODEL"}
                  </span>
                )}
              </div>

              <div className="flex justify-between flex-wrap gap-4">
                <div>
                  <div className="text-[#9ca3af] text-[0.9rem]">
                    Dominant Emotion
                  </div>

                  <div className="text-[1.5rem] font-bold">
                    {result.emotion}
                  </div>
                </div>

                <div>
                  <div className="text-[#9ca3af] text-[0.9rem]">
                    Confidence
                  </div>

                  <div className="text-[1.5rem] font-bold">
                    {typeof result.confidence === "number"
                      ? `${(result.confidence * 100).toFixed(2)}%`
                      : result.confidence}
                  </div>
                </div>
              </div>
            </div>

            <EmotionTimeline
              audioUrl={result.audio_url}
              timelineData={result.timeline_data}
            />
          </div>
        )}
      </div>
    </div>
  );
}