import { useState } from "react";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import "./Predict.css";

const MODEL_COLORS = {
  "Random Forest":       "#10b981",
  "Gradient Boosting":   "#3b82f6",
  "Decision Tree":       "#f59e0b",
  "SVM":                 "#8b5cf6",
  "Logistic Regression": "#06b6d4",
};

const AQI_COLORS = {
  "Good":             "#10b981",
  "Moderate":         "#f59e0b",
  "Unhealthy":        "#ef4444",
  "Very Unhealthy":   "#9333ea",
  "Hazardous":        "#dc2626",
  "Unhealthy for Sensitive Groups": "#f97316",
};

const POLLUTANT_COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#10b981"];

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
};

export default function Predict() {
  const [city, setCity]       = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handlePredict = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await axios.post("http://127.0.0.1:5000/predict-city", { city });
      setResult(res.data);
    } catch {
      setError("City not found or server error.");
    }
    setLoading(false);
  };

  // Build pollutant bar chart data
  const pollutantData = result?.pollutants
    ? [
        { name: "CO",     value: result.pollutants.co    },
        { name: "Ozone",  value: result.pollutants.ozone },
        { name: "NO₂",    value: result.pollutants.no2   },
        { name: "PM2.5",  value: result.pollutants.pm25  },
      ]
    : [];

  // All models array
  const allModels = result?.all_models
    ? Object.entries(result.all_models).map(([name, info]) => ({ name, ...info }))
    : [];

  return (
    <div className="predict-page">
      <div className="predict-header">
        <h1 className="predict-title">AQI Prediction</h1>
        <p className="predict-sub">Search any city to get predictions from all 5 models</p>
      </div>

      {/* Search bar — reuses your existing component */}
      <div className="predict-search">
        <SearchBar
          city={city}
          setCity={setCity}
          onPredict={handlePredict}
          loading={loading}
        />
      </div>

      {loading && <p className="predict-info">Analyzing air quality across all models…</p>}
      {error   && <p className="predict-error">{error}</p>}

      {result && (
        <div className="predict-results">

          {/* ── Row 1: Summary card + Pollutant chart ── */}
          <div className="predict-row-2">

            {/* Summary */}
            <div className="p-card summary-card">
              <div className="summary-city">{result.city}</div>
              {result.country && (
                <div className="summary-country">{result.country}</div>
              )}
              <div
                className="summary-category"
                style={{ color: AQI_COLORS[result.aqi_category] || "#1e293b" }}
              >
                {result.aqi_category}
              </div>
              <div className="summary-meta">
                Best model: <strong>{result.best_model}</strong>
              </div>
              <div className="summary-meta">
                Confidence: <strong>{result.confidence}%</strong>
              </div>

              {/* Pollutant values */}
              <div className="summary-pollutants">
                {pollutantData.map((p, i) => (
                  <div key={p.name} className="sp-row">
                    <span className="sp-name">{p.name}</span>
                    <div className="sp-bar-wrap">
                      <div
                        className="sp-bar"
                        style={{
                          width: `${Math.min((p.value / 300) * 100, 100)}%`,
                          background: POLLUTANT_COLORS[i],
                        }}
                      />
                    </div>
                    <span className="sp-val">{p.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pollutant bar chart */}
            <div className="p-card">
              <h3 className="p-card-title">Pollutant Levels</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={pollutantData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="value" name="AQI Value" radius={[6, 6, 0, 0]} barSize={48}>
                    {pollutantData.map((_, i) => (
                      <Cell key={i} fill={POLLUTANT_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Row 2: All 5 model predictions ── */}
          <div className="p-card models-card">
            <h3 className="p-card-title">All Model Predictions</h3>
            <div className="models-grid">
              {allModels.map((m) => (
                <div
                  key={m.name}
                  className={`model-card ${result.best_model === m.name ? "model-card-best" : ""}`}
                  style={{ "--mc": MODEL_COLORS[m.name] || "#64748b" }}
                >
                  {result.best_model === m.name && (
                    <span className="best-badge">⭐ Best</span>
                  )}
                  <div className="mc-name">{m.name}</div>
                  {m.error ? (
                    <div className="mc-error">{m.error}</div>
                  ) : (
                    <>
                      <div
                        className="mc-pred"
                        style={{ color: AQI_COLORS[m.prediction] || "#1e293b" }}
                      >
                        {m.prediction}
                      </div>
                      <div className="mc-conf-row">
                        <div className="mc-conf-track">
                          <div
                            className="mc-conf-fill"
                            style={{
                              width:      `${m.confidence}%`,
                              background: MODEL_COLORS[m.name],
                            }}
                          />
                        </div>
                        <span className="mc-conf-val">{m.confidence}%</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}