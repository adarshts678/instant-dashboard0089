import React, { useState } from "react";
import "./App.css";

function App() {
  const [jsonInput, setJsonInput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setError("");
    setLoading(true);

    let parsedJson;
    try {
      parsedJson = JSON.parse(jsonInput);
    } catch (e) {
      setError("Invalid JSON. Please check your input.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: parsedJson,
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error || "Server error");
      }

      const result = await response.json();
      setPreviewHtml(result.html || "<div>No HTML returned from AI.</div>");
    } catch (e) {
      console.error("Frontend error:", e);
      setError("Failed to generate dashboard.");
    }

    setLoading(false);
  };

  return (
    <div className="dashboard-container">
      <h1>The Instant Dashboard</h1>
      <div className="welcome-text">
        Welcome! Paste your JSON data below, enter your dashboard prompt, and
        generate a live preview instantly.
      </div>

      <div className="input-block">
        <label htmlFor="json-input" className="input-label">
          JSON Input
        </label>
        <textarea
          id="json-input"
          className="json-input"
          placeholder="Paste your JSON here..."
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={10}
        />
      </div>

      <div className="input-block">
        <label htmlFor="prompt-input" className="input-label">
          Prompt
        </label>
        <textarea
          id="prompt-input"
          className="prompt-input"
          placeholder="Enter your dashboard prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
        />
      </div>

      <button
        className="generate-btn"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && <div className="error-message">{error}</div>}

      <div className="preview-section">
        <h2>Preview</h2>
        <div
          className="preview-area"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </div>
  );
}

export default App;
