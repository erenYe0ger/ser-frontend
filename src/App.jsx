import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
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
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to analyze audio. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load prediction history from the backend
  const loadHistory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/history`
      );

      setHistory(response.data);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Failed to load history."
      );
    }
  };

  return (
    <div className="app">
      {/* Application Header */}
      <header>
        <h1>Speech Emotion Recognition</h1>
      </header>

      {/* Audio Upload Section */}
      <section className="card">
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

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
          <h2>Prediction Result</h2>

          {/* Predicted Emotion */}
          <div>
            <h1 style={{ margin: 0 }}>
              {String(result.emotion).charAt(0).toUpperCase() +
                String(result.emotion).slice(1)}
            </h1>
          </div>

          {/* Confidence Percentage */}
          <div>
            Confidence:{" "}
            <strong>
              {(Number(result.confidence) * 100).toFixed(1)}%
            </strong>
          </div>

          {/* Source Badge */}
          <div>
            <span className="badge">
              {result.source === "cache"
                ? "FROM CACHE"
                : "FROM MODEL"}
            </span>
          </div>

          {/* Emotion Confidence Bars */}
          {result.all_emotions && (
            <div>
              <h3>Emotion Probabilities</h3>

              {Object.entries(result.all_emotions).map(
                ([emotion, value]) => {
                  const percentage =
                    Number(value) * 100;

                  return (
                    <div key={emotion}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>
                          {emotion.charAt(0).toUpperCase() +
                            emotion.slice(1)}
                        </span>

                        <span>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      )}

      {/* Prediction History Section */}
      <section className="card">
        <div>
          <h2>History</h2>

          <button
            className="btn"
            onClick={loadHistory}
          >
            Load History
          </button>
        </div>

        {history.length > 0 ? (
          <ul>
            {history.map((item) => (
              <li
                key={item.id}
                className="history-item"
              >
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
                  {(Number(item.confidence) * 100).toFixed(
                    1
                  )}
                  %
                </div>

                <div>
                  {new Date(
                    item.created_at
                  ).toLocaleString()}
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

export default App;