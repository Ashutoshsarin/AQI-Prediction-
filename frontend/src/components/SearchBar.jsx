import { useTheme } from "../context/ThemeContext";
import "./SearchBar.css";

function SearchBar({ city, setCity, onPredict, loading }) {
  const { dark } = useTheme();

  const handleKey = (e) => {
    if (e.key === "Enter" && !loading && city.trim()) {
      onPredict();
    }
  };

  return (
    <div className={`searchbar-wrap ${dark ? "dark" : ""}`}>
      <div className="searchbar-box">
        <span className="searchbar-icon">🔍</span>
        <input
          type="text"
          className="searchbar-input"
          placeholder="Search city e.g. Delhi, Tokyo, London..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKey}
        />
        {city && (
          <button
            className="searchbar-clear"
            onClick={() => setCity("")}
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>
      <button
        className="searchbar-btn"
        onClick={onPredict}
        disabled={loading || !city.trim()}
      >
        {loading ? (
          <span className="searchbar-spinner" />
        ) : (
          <>
            <span>Predict AQI</span>
            <span className="btn-arrow">→</span>
          </>
        )}
      </button>
    </div>
  );
}

export default SearchBar;