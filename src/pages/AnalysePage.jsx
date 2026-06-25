import { useRef, useState } from "react";
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

  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setResult(null);
    setError(null);

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

  const tabButtonStyle = (active) => ({
    padding: "0.8rem 1.4rem",
    borderRadius: "10px",
    border: active ? "1px solid white" : "1px solid #444",
    background: active ? "#fff" : "transparent",
    color: active ? "#000" : "#9ca3af",
    cursor: "pointer",
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
          >
            Upload File
          </button>

          <button
            style={tabButtonStyle(activeTab === "record")}
            onClick={() => switchTab("record")}
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
              minHeight: "300px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              background: "#171717",
              borderRadius: "16px",
              border: "1px solid #2d2d2d",
            }}
          >
            <Mic size={64} color="#6366f1" />

            <h2
              style={{
                margin: 0,
                fontWeight: 600,
              }}
            >
              Mic recording coming soon
            </h2>

            <p
              style={{
                color: "#9ca3af",
                margin: 0,
              }}
            >
              Recording support will be available in a future update.
            </p>
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