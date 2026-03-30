import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import "./ModelComparison.css";

const MODELS_BASE = [
  {
    name: "Random Forest", color: "#10b981",
    pros: ["Strong baseline", "Handles class imbalance", "No scaling required"],
    cons: ["Slower than boosting models", "Large model size"],
    params: "Tuned via RandomizedSearchCV — max_depth, n_estimators, max_features",
  },
  {
    name: "XGBoost", color: "#3b82f6",
    pros: ["High accuracy", "Built-in regularization", "Handles missing values"],
    cons: ["More hyperparameters to tune", "Slower on large datasets"],
    params: "Tuned via RandomizedSearchCV — learning_rate, max_depth, subsample",
  },
  {
    name: "LightGBM", color: "#f59e0b",
    pros: ["Very fast training", "Low memory usage", "Excellent on large datasets"],
    cons: ["Can overfit on small datasets", "Sensitive to num_leaves"],
    params: "Tuned via RandomizedSearchCV — learning_rate, num_leaves, subsample",
  },
  {
    name: "CatBoost", color: "#8b5cf6",
    pros: ["Handles categorical features", "Auto class weighting", "Robust to overfitting"],
    cons: ["Slower training than LightGBM", "Large model size"],
    params: "Tuned via RandomizedSearchCV — depth, learning_rate, l2_leaf_reg",
  },
  {
    name: "Stacking", color: "#06b6d4",
    pros: ["Combines all 4 models", "Best generalization", "Research-level ensemble"],
    cons: ["Slowest inference", "Most complex model"],
    params: "Meta-learner: Logistic Regression — base: RF + XGB + LGBM + CatBoost",
  },
];

const METRIC_KEYS   = ["accuracy", "precision", "recall", "f1"];
const METRIC_LABELS = {
  accuracy: "Accuracy", precision: "Precision",
  recall: "Recall", f1: "F1",
};

const tooltipStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 12,
};

export default function ModelComparison() {
  const [selected, setSelected]         = useState(null);
  const [metric, setMetric]             = useState("accuracy");
  const [modelStats, setModelStats]     = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError]     = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/model-stats")
      .then(r => r.json())
      .then(data => { setModelStats(data); setLoadingStats(false); })
      .catch(() => { setStatsError("Could not load live stats from backend."); setLoadingStats(false); });
  }, []);

  const MODELS = MODELS_BASE.map(m => ({
    ...m,
    accuracy:  modelStats?.[m.name]?.accuracy  ?? 0,
    precision: modelStats?.[m.name]?.precision ?? 0,
    recall:    modelStats?.[m.name]?.recall    ?? 0,
    f1:        modelStats?.[m.name]?.f1        ?? 0,
    cvAcc:     modelStats?.[m.name]?.accuracy  ?? 0,
    cvF1:      modelStats?.[m.name]?.f1        ?? 0,
    mse:       modelStats?.[m.name]?.mse       ?? 0,
    rmse:      modelStats?.[m.name]?.rmse      ?? 0,
  }));

  const sorted        = [...MODELS].sort((a, b) => b[metric] - a[metric]);
  const selectedModel = MODELS.find(m => m.name === selected);

  const barData = MODELS.map(m => ({
    name: m.name,
    Accuracy:   m.accuracy,
    "F1 Score": m.f1,
  }));

  const radarData = METRIC_KEYS.map(k => {
    const row = { metric: METRIC_LABELS[k] };
    MODELS.forEach(model => { row[model.name] = model[k]; });
    return row;
  });

  return (
    <div className="model-page">

      <div className="model-page-header">
        <h1 className="model-page-title">Model Arena</h1>
        <p className="model-page-sub">
          Live comparison — Random Forest, XGBoost, LightGBM, CatBoost, Stacking
        </p>
      </div>

      {loadingStats && <div className="stats-loading">Computing live model statistics...</div>}
      {statsError   && <div className="stats-error">{statsError}</div>}

      {/* Metric tabs */}
      <div className="metric-tabs">
        {METRIC_KEYS.map(m => (
          <button
            key={m}
            className={`metric-tab ${metric === m ? "active" : ""}`}
            onClick={() => setMetric(m)}
          >
            {METRIC_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Ranked list */}
      <div className="ranked-list">
        {sorted.map((m, i) => (
          <div
            key={m.name}
            className={`rank-card ${selected === m.name ? "selected" : ""}`}
            style={{ "--model-color": m.color }}
            onClick={() => setSelected(selected === m.name ? null : m.name)}
          >
            <div className="rank-medal">
              {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
            </div>
            <div className="rank-name">{m.name}</div>
            <div className="rank-bar-wrap">
              <div className="rank-bar" style={{ width: `${m[metric]}%`, background: m.color }} />
            </div>
            <div className="rank-value" style={{ color: m.color }}>
              {loadingStats ? "..." : `${m[metric].toFixed(1)}%`}
            </div>
            <div className="rank-arrow">{selected === m.name ? "▲" : "▼"}</div>
          </div>
        ))}
      </div>

      {/* Detail panel */}
      {selectedModel && (
        <div className="detail-panel" style={{ "--model-color": selectedModel.color }}>
          <div className="dp-header">
            <div>
              <div className="dp-title" style={{ color: selectedModel.color }}>
                {selectedModel.name}
              </div>
              <code className="dp-params">{selectedModel.params}</code>
            </div>
            <div className="dp-metrics">
              {[
                { k: "accuracy", label: "Accuracy" },
                { k: "f1",       label: "F1 Score" },
                { k: "mse",      label: "MSE"      },
                { k: "rmse",     label: "RMSE"     },
              ].map(({ k, label }) => (
                <div key={k} className="dp-metric">
                  <span className="dp-m-val">
                    {selectedModel[k]}{k === "accuracy" || k === "f1" ? "%" : ""}
                  </span>
                  <span className="dp-m-key">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <hr className="divider" />
          <div className="dp-pros-cons">
            <div>
              <div className="pc-title">Strengths</div>
              {selectedModel.pros.map((p, i) => <div key={i} className="pc-item">+ {p}</div>)}
            </div>
            <div>
              <div className="pc-title">Limitations</div>
              {selectedModel.cons.map((c, i) => <div key={i} className="pc-item">- {c}</div>)}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {!loadingStats && (
        <div className="charts-row">
          <div className="chart-card">
            <div className="chart-card-title">Accuracy vs F1 Score</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: -10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false} tickLine={false}
                  interval={0} angle={-20} textAnchor="end" height={70}
                />
                <YAxis
                  domain={[Math.max(0, Math.min(...MODELS.map(m => m.accuracy)) - 10), 100]}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
                <Bar dataKey="Accuracy"  fill="#3b82f6" radius={[4,4,0,0]} barSize={18} />
                <Bar dataKey="F1 Score"  fill="#10b981" radius={[4,4,0,0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-card-title">Multi-Metric Radar</div>
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={radarData} margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 13, fill: "#475569", fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  domain={[Math.max(0, Math.min(...MODELS.map(m => m.accuracy)) - 10), 100]}
                  tick={false} axisLine={false} tickCount={5}
                />
                {MODELS.map(m => (
                  <Radar
                    key={m.name}
                    name={m.name}
                    dataKey={m.name}
                    stroke={m.color}
                    fill={m.color}
                    fillOpacity={m.name === "Stacking" ? 0.2 : 0.06}
                    strokeWidth={m.name === "Stacking" ? 2.5 : 2}
                    strokeDasharray={m.name === "Stacking" ? "6 3" : "0"}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} iconType="circle" />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Full metrics table */}
      {!loadingStats && (
        <div className="metrics-card">
          <div className="chart-card-title">Full Metrics Table — Live Results</div>
          <div className="metrics-table-wrap">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Accuracy</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1</th>
                  <th>MSE</th>
                  <th>RMSE</th>
                </tr>
              </thead>
              <tbody>
                {[...MODELS].sort((a, b) => b.accuracy - a.accuracy).map((m) => (
                  <tr key={m.name}>
                    <td>
                      <div className="td-name">
                        <span className="model-dot" style={{ background: m.color }} />
                        {m.name}
                      </div>
                    </td>
                    <td className="td-best">{m.accuracy}%</td>
                    <td>{m.precision}%</td>
                    <td>{m.recall}%</td>
                    <td>{m.f1}%</td>
                    <td>{m.mse}</td>
                    <td>{m.rmse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}