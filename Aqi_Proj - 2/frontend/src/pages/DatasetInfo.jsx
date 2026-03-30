import { useState } from "react";
import "./DatasetInfo.css";

const SAMPLE_ROWS = [
  { country: "India",   city: "Delhi",      co: 29, ozone: 36, no2: 137, pm25: 25,  aqi: 137, category: "Unhealthy" },
  { country: "China",   city: "Beijing",    co: 45, ozone: 52, no2: 165, pm25: 78,  aqi: 189, category: "Very Unhealthy" },
  { country: "USA",     city: "New York",   co: 12, ozone: 28, no2: 44,  pm25: 18,  aqi: 58,  category: "Moderate" },
  { country: "India",   city: "Mumbai",     co: 38, ozone: 41, no2: 118, pm25: 55,  aqi: 148, category: "Unhealthy" },
  { country: "Brazil",  city: "Sao Paulo",  co: 31, ozone: 44, no2: 92,  pm25: 42,  aqi: 125, category: "Unhealthy" },
  { country: "Germany", city: "Berlin",     co: 8,  ozone: 22, no2: 35,  pm25: 12,  aqi: 42,  category: "Good" },
  { country: "Pakistan",city: "Lahore",     co: 62, ozone: 71, no2: 188, pm25: 115, aqi: 248, category: "Very Unhealthy" },
  { country: "Egypt",   city: "Cairo",      co: 55, ozone: 68, no2: 175, pm25: 98,  aqi: 218, category: "Very Unhealthy" },
  { country: "Japan",   city: "Tokyo",      co: 18, ozone: 32, no2: 58,  pm25: 22,  aqi: 72,  category: "Moderate" },
  { country: "UK",      city: "London",     co: 14, ozone: 26, no2: 48,  pm25: 16,  aqi: 55,  category: "Moderate" },
];

const SCHEMA = [
  { col: "country",         type: "string",  desc: "Country name" },
  { col: "city_name",       type: "string",  desc: "City name" },
  { col: "co_aqi_value",    type: "integer", desc: "Carbon Monoxide AQI index",       badge: "feature" },
  { col: "ozone_aqi_value", type: "integer", desc: "Ozone AQI index",                 badge: "feature" },
  { col: "no2_aqi_value",   type: "integer", desc: "Nitrogen Dioxide AQI index",      badge: "feature" },
  { col: "pm2.5_aqi_value", type: "integer", desc: "Fine Particulate Matter AQI index", badge: "feature" },
  { col: "aqi_value",       type: "integer", desc: "Overall AQI index (max of above)" },
  { col: "aqi_category",    type: "string",  desc: "Target: Good / Moderate / Unhealthy / Very Unhealthy / Hazardous", badge: "target" },
];

const CAT_COLORS = {
  Good:             { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  Moderate:         { bg: "#fefce8", color: "#ca8a04", border: "#fde68a" },
  Unhealthy:        { bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
  "Very Unhealthy": { bg: "#faf5ff", color: "#9333ea", border: "#e9d5ff" },
  Hazardous:        { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
};

export default function DatasetInfo() {
  const [search, setSearch] = useState("");

  const filtered = SAMPLE_ROWS.filter(r =>
    r.city.toLowerCase().includes(search.toLowerCase()) ||
    r.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dataset-page">
      <div className="ds-header">
        <h1 className="ds-title">Dataset Explorer</h1>
        <p className="ds-sub">Global Air Pollution Dataset — 32,000 records from cities worldwide</p>
      </div>

      {/* Stat cards — 4 columns */}
      <div className="ds-stats-grid">
        {[
          { val: "32,000",  label: "Total Records",  sub: "after cleaning",          cls: "ds-blue"   },
          { val: "4",       label: "Features Used",  sub: "CO, Ozone, NO2, PM2.5",   cls: "ds-cyan"   },
          { val: "6",       label: "Target Classes", sub: "AQI categories",           cls: "ds-purple" },
          { val: "Kaggle & API",  label: "Source",         sub: "global_air_pollution_data.csv", cls: "ds-green" },
        ].map((c, i) => (
          <div key={i} className={`ds-stat-card ${c.cls}`}>
            <div className="ds-val">{c.val}</div>
            <div className="ds-label">{c.label}</div>
            <div className="ds-sub-text">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Schema */}
      <div className="ds-card">
        <div className="ds-card-title">Column Schema</div>
        <div className="schema-list">
          {SCHEMA.map((s, i) => (
            <div key={i} className="schema-row">
              <code className="schema-col">{s.col}</code>
              <span className={`schema-type type-${s.type}`}>{s.type}</span>
              <span className="schema-desc">{s.desc}</span>
              {s.badge === "feature" && <span className="schema-badge badge-feature">Feature</span>}
              {s.badge === "target"  && <span className="schema-badge badge-target">Target</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Sample table */}
      <div className="ds-card">
        <div className="ds-table-header">
          <div className="ds-card-title" style={{ margin: 0 }}>Sample Records</div>
          <input
            className="ds-search"
            placeholder="Filter by city or country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="ds-table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Country</th>
                <th>City</th>
                <th>CO AQI</th>
                <th>Ozone AQI</th>
                <th>NO2 AQI</th>
                <th>PM2.5 AQI</th>
                <th>AQI</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const c = CAT_COLORS[r.category] || { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
                return (
                  <tr key={i}>
                    <td>{r.country}</td>
                    <td><strong style={{ color: "#1e293b" }}>{r.city}</strong></td>
                    <td>{r.co}</td>
                    <td>{r.ozone}</td>
                    <td>{r.no2}</td>
                    <td>{r.pm25}</td>
                    <td><strong style={{ color: "#1e293b" }}>{r.aqi}</strong></td>
                    <td>
                      <span
                        className="cat-badge"
                        style={{ background: c.bg, color: c.color, borderColor: c.border }}
                      >
                        {r.category}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "#94a3b8", padding: "2rem" }}>
                    No records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="ds-footer">Showing {filtered.length} of 32,000 records.</div>
      </div>
    </div>
  );
}