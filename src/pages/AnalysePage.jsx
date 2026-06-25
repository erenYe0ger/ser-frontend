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

      formData.append(
        "file",
        recordedBlob,
        "recording.webm"
      );

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

  const tabButtonStyle = (active) => ({
    padding: "0.8rem 1.4rem",
    borderRadius: "10px",
    border: active ? "1px solid white" : "1px solid #444",
    background: active ? "#fff" : "transparent",
    color: active ? "#000" : "#9ca3af",
    cursor: isRecording
      ? "not-allowed"
      : "pointer",
    opacity: isRecording ? 0.5 : 1,
    fontSize: "0.95rem",
    fontWeight: 600,
    transition: "0.2s",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "white",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: "2rem",
            fontSize: "2rem",
            fontWeight: 700,
          }}
        >
          Analyse Audio
        </h1>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <button
            style={tabButtonStyle(activeTab === "upload")}
            onClick={() => switchTab("upload")}
            disabled={isRecording}
          >
            Upload File
          </button>

          <button
            style={tabButtonStyle(activeTab === "record")}
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
              style={{
                border: "2px dashed #333",
                borderRadius: "16px",
                minHeight: "240px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                cursor: "pointer",
                transition: "0.2s",
                background: "#171717",
                padding: "2rem",
                color: "#d1d5db",
                fontSize: "1rem",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#6366f1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#333")
              }
            >
              <div>
                {file ? (
                  <>
                    <div
                      style={{
                        fontSize: "3rem",
                        marginBottom: "1rem",
                      }}
                    >
                      🎵
                    </div>

                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 600,
                      }}
                    >
                      {file.name}
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: "3rem",
                        marginBottom: "1rem",
                      }}
                    >
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
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            <button
              onClick={handleAnalyse}
              disabled={!file || isLoading}
              style={{
                width: "100%",
                marginTop: "1.5rem",
                padding: "1rem",
                background: !file || isLoading ? "#3f3f46" : "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: !file || isLoading ? "not-allowed" : "pointer",
                transition: "0.2s",
              }}
            >
              {isLoading ? "Analysing..." : "Analyse"}
            </button>

            {error && (
              <div
                style={{
                  marginTop: "1rem",
                  color: "#ef4444",
                  background: "#2b1111",
                  border: "1px solid #7f1d1d",
                  borderRadius: "10px",
                  padding: "1rem",
                }}
              >
                {error}
              </div>
            )}
          </>
        )}

        {activeTab === "record" && (
          <div
            style={{
              minHeight: "320px",
              background: "#171717",
              borderRadius: "16px",
              border: "1px solid #2d2d2d",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
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
                    style={{
                      background:
                        "#ef4444",
                      color: "white",
                      border: "none",
                      padding:
                        "1rem 2rem",
                      borderRadius:
                        "10px",
                      fontSize:
                        "1rem",
                      fontWeight: 600,
                      cursor:
                        "pointer",
                    }}
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

                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                  }}
                >
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

                <div
                  style={{
                    width: "100%",
                    height: 6,
                    background: "#333",
                    borderRadius: 999,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        (recordingTime /
                          60) *
                        100
                      }%`,
                      height: "100%",
                      background:
                        "#ef4444",
                      transition:
                        "width 1s linear",
                    }}
                  />
                </div>

                <button
                  onClick={
                    stopRecording
                  }
                  style={{
                    background:
                      "#ef4444",
                    color: "white",
                    border: "none",
                    padding:
                      "1rem 2rem",
                    borderRadius:
                      "10px",
                    fontSize:
                      "1rem",
                    fontWeight: 600,
                    cursor:
                      "pointer",
                  }}
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
                    style={{
                      width: "100%",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      width: "100%",
                    }}
                  >
                    <button
                      onClick={
                        submitRecording
                      }
                      disabled={
                        isLoading
                      }
                      style={{
                        flex: 1,
                        background:
                          "#6366f1",
                        color:
                          "white",
                        border:
                          "none",
                        padding:
                          "1rem",
                        borderRadius:
                          "10px",
                        fontWeight: 600,
                        cursor:
                          "pointer",
                      }}
                    >
                      {isLoading
                        ? "Analysing..."
                        : "Submit"}
                    </button>

                    <button
                      onClick={
                        discardRecording
                      }
                      style={{
                        flex: 1,
                        background:
                          "transparent",
                        color:
                          "#ef4444",
                        border:
                          "1px solid #ef4444",
                        padding:
                          "1rem",
                        borderRadius:
                          "10px",
                        fontWeight: 600,
                        cursor:
                          "pointer",
                      }}
                    >
                      Discard
                    </button>
                  </div>
                </>
              )}
          {error && (
            <div
              style={{
                width: "100%",
                boxSizing: "border-box",
                marginTop: "1rem",
                color: "#ef4444",
                background: "#2b1111",
                border: "1px solid #7f1d1d",
                borderRadius: "10px",
                padding: "1rem",
              }}
            >
              {error}
            </div>
          )}
          </div>
        )}

        {result && (
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                background: "#171717",
                border: "1px solid #2d2d2d",
                borderRadius: "16px",
                padding: "1.5rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: "1rem",
                  fontSize: "1.2rem",
                }}
              >
                Overall Result
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.9rem",
                    }}
                  >
                    Dominant Emotion
                  </div>

                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                    }}
                  >
                    {result.emotion}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.9rem",
                    }}
                  >
                    Confidence
                  </div>

                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                    }}
                  >
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