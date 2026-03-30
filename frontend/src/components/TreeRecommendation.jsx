import { getTreeRecommendation } from "../utils/treeRecommendations";

function TreeRecommendation({ dominantPollutant }) {
  if (!dominantPollutant) return null;

  const recommendation = getTreeRecommendation(dominantPollutant);
  if (!recommendation) return null;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🌱 Environmental Recommendation</h3>

      <p style={styles.sub}>
        High levels of <strong>{recommendation.gas}</strong> detected.
      </p>

      <p style={styles.reason}>{recommendation.reason}</p>

      <ul style={styles.list}>
        {recommendation.trees.map((tree, index) => (
          <li key={index} style={styles.listItem}>
            <span style={styles.treeIcon}>🌳</span>
            <span style={styles.treeName}>{tree.name}</span>
            <a
              href={tree.link}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              Learn more →
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  card: {
    background: "#ecfdf5",
    padding: "20px",
    borderRadius: "14px",
    borderLeft: "6px solid #22c55e",
    height: "100%",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#14532d",
    marginBottom: "10px",
  },
  sub: {
    fontSize: "14px",
    color: "#1e293b",
    marginBottom: "6px",
  },
  reason: {
    fontSize: "13px",
    color: "#065f46",
    marginBottom: "14px",
    lineHeight: "1.6",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #bbf7d0",
  },
  treeIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  treeName: {
    fontSize: "13px",
    color: "#1e293b",
    fontWeight: 500,
    flex: 1,
  },
  link: {
    fontSize: "12px",
    color: "#16a34a",
    textDecoration: "none",
    fontWeight: 600,
    whiteSpace: "nowrap",
    padding: "2px 8px",
    borderRadius: "4px",
    background: "#dcfce7",
    border: "1px solid #86efac",
  },
};

export default TreeRecommendation;