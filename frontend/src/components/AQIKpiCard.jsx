const POLLUTANT_INFO = {
  co:    { label: "CO",     max: 300, ranges: "0–50 Good · 51–100 Moderate · 101–150 Unhealthy · 150+ Hazardous" },
  ozone: { label: "Ozone",  max: 300, ranges: "0–54 Good · 55–124 Moderate · 125–164 Unhealthy · 165+ Hazardous" },
  no2:   { label: "NO₂",   max: 300, ranges: "0–53 Good · 54–100 Moderate · 101–360 Unhealthy · 360+ Hazardous" },
  pm25:  { label: "PM2.5",  max: 300, ranges: "0–12 Good · 13–35 Moderate · 36–55 Unhealthy · 55+ Hazardous"    },
};

function getBarColor(value) {
  if (value <= 50)  return "#10b981";
  if (value <= 100) return "#f59e0b";
  if (value <= 150) return "#f97316";
  return "#ef4444";
}

function getAQIStyle(category) {
  switch (category) {
    case "Good":           return { bg: "#dcfce7", color: "#166534" };
    case "Moderate":       return { bg: "#fef9c3", color: "#854d0e" };
    case "Unhealthy":      return { bg: "#ffedd5", color: "#9a3412" };
    case "Very Unhealthy": return { bg: "#fee2e2", color: "#991b1b" };
    case "Hazardous":      return { bg: "#fecaca", color: "#7f1d1d" };
    default:               return { bg: "#e0e7ff", color: "#3730a3" };
  }
}

function AQIKpiCard({ result }) {
  const style = getAQIStyle(result.aqi_category);
  const pollutants = result.pollutants;

  return (
    <div style={styles.card}>
      {/* City + badge */}
      <h3 style={styles.city}>{result.city}</h3>
      <div style={{ ...styles.badge, background: style.bg, color: style.color }}>
        {result.aqi_category}
      </div>
      <p style={styles.confidence}>
        Confidence: <strong>{result.confidence}%</strong>
        &nbsp;·&nbsp;Best model: <strong>{result.best_model}</strong>
      </p>

      <hr style={styles.divider} />

      {/* Pollutant rows with range bars */}
      <div style={styles.pollutants}>
        {Object.entries(POLLUTANT_INFO).map(([key, info]) => {
          const value = pollutants[key] ?? 0;
          const pct   = Math.min((value / info.max) * 100, 100);
          const color = getBarColor(value);

          return (
            <div key={key} style={styles.pollRow}>
              {/* Label + value */}
              <div style={styles.pollHeader}>
                <span style={styles.pollLabel}>{info.label}</span>
                <span style={{ ...styles.pollValue, color }}>{value}</span>
              </div>

              {/* Progress bar */}
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${pct}%`, background: color }} />
              </div>

              {/* Range hint */}
              <div style={styles.rangeHint}>{info.ranges}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "24px",
    borderRadius: "14px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    height: "100%",
    boxSizing: "border-box",
  },
  city: {
    fontSize: "1.8rem",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 8px",
  },
  badge: {
    display: "inline-block",
    padding: "5px 14px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "0.9rem",
    marginBottom: "10px",
  },
  confidence: {
    fontSize: "0.83rem",
    color: "#64748b",
    margin: "0 0 12px",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #f1f5f9",
    margin: "0 0 16px",
  },
  pollutants: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  pollRow: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  pollHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pollLabel: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#334155",
  },
  pollValue: {
    fontSize: "0.9rem",
    fontWeight: 700,
  },
  barTrack: {
    height: "8px",
    background: "#f1f5f9",
    borderRadius: "4px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
  },
  rangeHint: {
    fontSize: "0.7rem",
    color: "#94a3b8",
    lineHeight: 1.4,
  },
};

export default AQIKpiCard;