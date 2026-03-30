import { useState } from "react";
import axios from "axios";
import SearchBar from "../components/SearchBar";
import AQIKpiCard from "../components/AQIKpiCard";
import PollutantChart from "../components/PollutantChart";
import EmptyState from "../components/EmptyState";
import TreeRecommendation from "../components/TreeRecommendation";
import ForecastChart from "../components/ForecastChart";
import Footer from "../components/Footer";
import MapBackground from "../components/MapBackground";
import "./Dashboard.css";

const MODEL_COLORS = {
  "Random Forest": "#10b981",
  "XGBoost":       "#3b82f6",
  "LightGBM":      "#f59e0b",
  "CatBoost":      "#8b5cf6",
  "Stacking":      "#06b6d4",
};

const AQI_COLORS = {
  "Good":                           "#10b981",
  "Moderate":                       "#f59e0b",
  "Unhealthy for Sensitive Groups": "#f97316",
  "Unhealthy":                      "#ef4444",
  "Very Unhealthy":                 "#9333ea",
  "Hazardous":                      "#dc2626",
};

function Dashboard() {
  const [city, setCity]       = useState("");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [searchedCity, setSearchedCity] = useState("");

  const predictAQI = async (cityName) => {
    const searchCity = cityName || city;
    if (!searchCity.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:5000/predict-city", { city: searchCity });
      setResult(res.data);
      setSearchedCity(searchCity);
    } catch {
      setError("City not found or server error");
      setResult(null);
      setSearchedCity("");
    }
    setLoading(false);
  };

  const handleCityClick = (c) => {
    setCity(c);
    predictAQI(c);
  };

  const analyticsData = result?.pollutants
    ? [
        { name: "CO",    value: result.pollutants.co    },
        { name: "Ozone", value: result.pollutants.ozone },
        { name: "NO2",   value: result.pollutants.no2   },
        { name: "PM2.5", value: result.pollutants.pm25  },
      ]
    : [];

  const dominantPollutant = analyticsData.length > 0
    ? analyticsData.reduce((max, item) => item.value > max.value ? item : max, analyticsData[0])
    : null;

  const allModels = result?.all_models
    ? Object.entries(result.all_models).map(([name, info]) => ({ name, ...info }))
    : [];

  const predictionVotes = allModels.reduce((acc, m) => {
    if (!m.error) acc[m.prediction] = (acc[m.prediction] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="dash-page">
      <MapBackground />

      {/* ── Search bar ── */}
      <div className="dash-searchbar">
        <SearchBar
          city={city}
          setCity={setCity}
          onPredict={() => predictAQI()}
          loading={loading}
        />
      </div>

      {loading && <p className="dash-info">Analyzing air quality across all models…</p>}
      {error   && <p className="dash-error">{error}</p>}

      {result ? (
        <div className="dash-content">

          {/* Row 1 — KPI + Tree */}
          <div className="dash-row-2">
            <AQIKpiCard result={result} />
            {dominantPollutant && (
              <TreeRecommendation dominantPollutant={dominantPollutant.name} />
            )}
          </div>

          {/* Row 2 — All 5 models */}
          {allModels.length > 0 && (
            <div className="models-section">
              <div className="models-header">
                <h3 className="models-title">All Model Predictions</h3>
                <div className="models-consensus">
                  {Object.entries(predictionVotes).map(([pred, count]) => (
                    <span
                      key={pred}
                      className="consensus-badge"
                      style={{
                        background: `${AQI_COLORS[pred] || "#64748b"}22`,
                        color:      AQI_COLORS[pred] || "#64748b",
                        border:     `1px solid ${AQI_COLORS[pred] || "#64748b"}44`,
                      }}
                    >
                      {count}/5 agree — {pred}
                    </span>
                  ))}
                </div>
              </div>

              <div className="models-grid">
                {allModels.map((m) => (
                  <div
                    key={m.name}
                    className={`model-card ${result.best_model === m.name ? "model-card-best" : ""}`}
                    style={{ "--model-color": MODEL_COLORS[m.name] || "#64748b" }}
                  >
                    {result.best_model === m.name && (
                      <span className="model-best-badge">Best</span>
                    )}
                    <div className="model-name">{m.name}</div>
                    {m.error ? (
                      <div className="model-error">Error: {m.error}</div>
                    ) : (
                      <>
                        <div
                          className="model-prediction"
                          style={{ color: AQI_COLORS[m.prediction] || "#1e293b" }}
                        >
                          {m.prediction}
                        </div>
                        <div className="model-conf-row">
                          <div className="model-conf-bar-wrap">
                            <div
                              className="model-conf-bar"
                              style={{
                                width:      `${m.confidence}%`,
                                background: MODEL_COLORS[m.name] || "#64748b",
                              }}
                            />
                          </div>
                          <span className="model-conf-val">{m.confidence}%</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 3 — 7-Day LSTM Forecast */}
          <ForecastChart city={searchedCity} />

          {/* Row 4 — Pollutant chart */}
          <div className="dash-full">
            <PollutantChart
              pollutants={result.pollutants}
              aqiCategory={result.aqi_category}
            />
          </div>

        </div>
      ) : (
        /* ── Empty state: floats top-right over the map ── */
        !loading && (
          <div className="dash-empty-overlay">
            <EmptyState onCityClick={handleCityClick} />
          </div>
        )
      )}

      <Footer />
    </div>
  );
}

export default Dashboard;