function EmptyState({ onCityClick }) {
  const cities = ["Delhi", "Mumbai", "Tokyo", "London", "Beijing", "New York"];

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* Subtle top shimmer line */}
        <div style={styles.shimmerLine} />

        <div style={styles.iconWrap}>
          <span style={styles.icon}>🌍</span>
        </div>

        <h3 style={styles.title}>Welcome to AQI Analytics</h3>

        <p style={styles.text}>
          Enter a city name above to view Air Quality insights,
          pollutant analytics, and ML-based AQI prediction.
        </p>

        <div style={styles.divider} />

        <p style={styles.hint}>Try one of these cities:</p>

        <div style={styles.cities}>
          {cities.map(c => (
            <span
              key={c}
              style={styles.cityTag}
              onClick={() => onCityClick && onCityClick(c)}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(37,99,235,0.18)";
                e.currentTarget.style.borderColor = "rgba(37,99,235,0.5)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  /* Centers the card in the right panel area */
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },

  card: {
    position: "relative",
    width: "100%",
    maxWidth: "400px",
    padding: "36px 32px 32px",
    borderRadius: "20px",
    textAlign: "center",
    overflow: "hidden",

    /* Glassmorphism */
    background: "rgba(255, 255, 255, 0.18)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow:
      "0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 0 rgba(255,255,255,0.4) inset",
  },

  /* Top inner highlight line */
  shimmerLine: {
    position: "absolute",
    top: 0,
    left: "15%",
    width: "70%",
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
    borderRadius: "1px",
  },

  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.25)",
    border: "1px solid rgba(255,255,255,0.35)",
    margin: "0 auto 18px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
  },

  icon: {
    fontSize: "1.75rem",
    lineHeight: 1,
  },

  title: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#0f172a",
    margin: "0 0 10px",
    letterSpacing: "-0.01em",
  },

  text: {
    color: "#334155",
    lineHeight: "1.7",
    fontSize: "0.88rem",
    maxWidth: "340px",
    margin: "0 auto",
  },

  divider: {
    width: "40px",
    height: "1px",
    background: "rgba(0,0,0,0.12)",
    margin: "20px auto",
    borderRadius: "1px",
  },

  hint: {
    fontSize: "0.75rem",
    color: "#64748b",
    marginBottom: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  cities: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "center",
  },

  cityTag: {
    padding: "6px 15px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    color: "#1e40af",
    fontSize: "0.8rem",
    fontWeight: 600,
    border: "1px solid rgba(255,255,255,0.25)",
    cursor: "pointer",
    transition: "all 0.15s ease",
    userSelect: "none",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
  },
};

export default EmptyState;