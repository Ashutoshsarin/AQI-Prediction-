import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import "./ForecastChart.css";

const AQI_COLORS = {
  "Good":                           "#10b981",
  "Moderate":                       "#f59e0b",
  "Unhealthy for Sensitive Groups": "#f97316",
  "Unhealthy":                      "#ef4444",
  "Very Unhealthy":                 "#9333ea",
  "Hazardous":                      "#dc2626",
};

const AQI_BG = {
  "Good":                           "#f0fdf4",
  "Moderate":                       "#fefce8",
  "Unhealthy for Sensitive Groups": "#fff7ed",
  "Unhealthy":                      "#fef2f2",
  "Very Unhealthy":                 "#faf5ff",
  "Hazardous":                      "#fef2f2",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0",
        borderRadius: 10, padding: "10px 14px",
        fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}>
        <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
          {d.day} — {d.date}
        </div>
        <div style={{ color: AQI_COLORS[d.category] || "#64748b", fontWeight: 600 }}>
          AQI: {d.aqi}
        </div>
        <div style={{ color: "#64748b", fontSize: 12 }}>{d.category}</div>
      </div>
    );
  }
  return null;
};

export default function ForecastChart({ city }) {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [debug, setDebug]       = useState("");

  useEffect(() => {
    if (!city || !city.trim()) return;

    setLoading(true);
    setError("");
    setDebug("");
    setForecast([]);

    console.log("ForecastChart: fetching for city =", city);

    fetch("http://127.0.0.1:5000/predict-forecast", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ city: city.trim() }),
    })
      .then(r => {
        console.log("Forecast response status:", r.status);
        return r.json();
      })
      .then(data => {
        console.log("Forecast data:", data);
        if (data.error) {
          setError(data.error);
          setDebug(JSON.stringify(data));
        } else {
          setForecast(data.forecast || []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Forecast fetch error:", err);
        setError("Could not connect to forecast API.");
        setDebug(err.message);
        setLoading(false);
      });
  }, [city]);

  if (!city || !city.trim()) return null;

  if (loading) return (
    <div className="forecast-loading">
      Loading 7-day LSTM forecast for {city}...
    </div>
  );

  if (error) return (
    <div className="forecast-error">
      <strong>Forecast unavailable:</strong> {error}
      {debug && <div style={{ fontSize: "0.75rem", marginTop: 4, color: "#94a3b8" }}>{debug}</div>}
    </div>
  );

  if (!forecast.length) return (
    <div className="forecast-loading">No forecast data returned.</div>
  );

  return (
    <div className="forecast-card">
      <div className="forecast-header">
        <h3 className="forecast-title">7-Day AQI Forecast — {city} (Using Free Api Key)</h3>
        <span className="forecast-badge">LSTM Model</span>
      </div>

      {/* Day cards */}
      <div className="forecast-days">
        {forecast.map((d, i) => (
          <div
            key={i}
            className="forecast-day"
            style={{
              background:  AQI_BG[d.category]    || "#f8fafc",
              borderColor: AQI_COLORS[d.category] || "#e2e8f0",
            }}
          >
            <div className="fd-day">{d.day}</div>
            <div className="fd-aqi" style={{ color: AQI_COLORS[d.category] || "#1e293b" }}>
              {d.aqi}
            </div>
            <div className="fd-cat" style={{ color: AQI_COLORS[d.category] || "#64748b" }}>
              {d.category === "Unhealthy for Sensitive Groups" ? "USG" : d.category}
            </div>
          </div>
        ))}
      </div>

      {/* Area chart */}
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="aqi-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={50}  stroke="#10b981" strokeDasharray="3 3" />
          <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" />
          <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" />
          <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#3b82f6"
            strokeWidth={2.5}
            fill="url(#aqi-gradient)"
            dot={{ r: 5, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}