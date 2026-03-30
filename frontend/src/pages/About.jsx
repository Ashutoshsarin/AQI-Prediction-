import "./About.css";

const SKILLS = [
  { category: "Machine Learning", items: ["Random Forest", "XGBoost", "LightGBM", "CatBoost", "Stacking Ensemble", "LSTM"] },
  { category: "Backend",          items: ["Python", "Flask", "REST API", "Scikit-learn", "Pandas", "NumPy"] },
  { category: "Frontend",         items: ["React", "Recharts", "Leaflet.js", "CSS Variables", "React Router"] },
  { category: "ML Techniques",    items: ["Cross Validation", "RandomizedSearchCV", "Class Balancing", "Feature Scaling", "Time Series"] },
];

const TIMELINE = [
  { step: "01", title: "Data Collection",      desc: "32,000 records from 97 cities worldwide with 6 AQI categories — Good, Moderate, Unhealthy for Sensitive Groups, Unhealthy, Very Unhealthy, Hazardous." },
  { step: "02", title: "Data Preprocessing",   desc: "Label encoding, StandardScaler normalization, class imbalance handling, stratified train/test split, proper test set isolation." },
  { step: "03", title: "Model Training",        desc: "5 ML models trained with RandomizedSearchCV hyperparameter tuning: Random Forest, XGBoost, LightGBM, CatBoost, and Stacking Ensemble." },
  { step: "04", title: "LSTM Forecasting",      desc: "Time series LSTM model trained on 365 days of historical data per city to forecast AQI for the next 7 days." },
  { step: "05", title: "Flask API",             desc: "REST API with 6 endpoints: city prediction, manual prediction, model stats, 7-day forecast, city list, and health check." },
  { step: "06", title: "React Frontend",        desc: "5-page professional React application with interactive charts, Leaflet map, AQI gauge, model comparison, and EDA visualizations." },
];

const MODELS_INFO = [
  { name: "Random Forest",     acc: "99.8%", desc: "Ensemble of decision trees — strong baseline with class balancing" },
  { name: "XGBoost",           acc: "99.8%", desc: "Gradient boosted trees with regularization — handles complex patterns" },
  { name: "LightGBM",          acc: "99.8%", desc: "Fast gradient boosting — excellent on large datasets" },
  { name: "CatBoost",          acc: "99.8%", desc: "Gradient boosting with auto class weighting — robust to overfitting" },
  { name: "Stacking Ensemble", acc: "99.8%", desc: "Meta-learner combining all 4 models — research-level technique" },
  { name: "LSTM",              acc: "7-day", desc: "Deep learning time series model — forecasts future AQI trends" },
];

const STATS = [
  { value: "32,000", label: "Training Records" },
  { value: "97",     label: "Cities Worldwide" },
  { value: "6",      label: "AQI Categories" },
  { value: "5+1",    label: "ML Models" },
  { value: "99.8%",  label: "Best Accuracy" },
  { value: "7-Day",  label: "LSTM Forecast" },
];

export default function About() {
  return (
    <div className="about-page">

      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero-left">
          <div className="about-tag">About This Project</div>
          <h1 className="about-title">
            AQI Analytics
            <span className="about-title-accent"> Platform</span>
          </h1>
          <p className="about-desc">
            A full-stack machine learning application that predicts Air Quality Index
            categories for cities worldwide using 5 advanced ML models and LSTM-based
            7-day forecasting. Built with React, Flask, and scikit-learn.
            Note: Real-time AQI accuracy is contingent upon the data refresh intervals 
            of the OpenWeather free-tier API.
          </p>
          <div className="about-author">
            <div className="author-avatar">AS</div>
            <div>
              <div className="author-name">Ashutosh Sarin</div>
              <div className="author-role">ML Engineer & Data Analytics</div>
              <a
                href="https://www.linkedin.com/in/ashutosh-sarin-4b366a371/"
                target="_blank"
                rel="noopener noreferrer"
                className="author-linkedin"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a66c2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="about-stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="about-stat-card">
              <div className="about-stat-value">{s.value}</div>
              <div className="about-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div className="about-section">
        <h2 className="about-section-title">Project Purpose</h2>
        <div className="purpose-grid">
          {[
            { icon: "🌍", title: "Real World Problem",    desc: "Air pollution affects 9 out of 10 people globally. This tool makes AQI prediction accessible to everyone through a simple city search." },
            { icon: "🤖", title: "ML Research",           desc: "Demonstrates advanced ensemble methods, hyperparameter tuning, class imbalance handling, and deep learning forecasting in a production setting." },
            { icon: "💼", title: "Portfolio Project",     desc: "Showcases full-stack ML engineering skills — from data preprocessing to model deployment to React frontend — for job applications." },
            { icon: "📊", title: "Educational Value",     desc: "Compares 5 ML models side-by-side with live metrics, helping understand the trade-offs between accuracy, speed, and complexity." },
          ].map((p, i) => (
            <div key={i} className="purpose-card">
              <div className="purpose-icon">{p.icon}</div>
              <div className="purpose-title">{p.title}</div>
              <div className="purpose-desc">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="about-section">
        <h2 className="about-section-title">How It Works</h2>
        <div className="timeline">
          {TIMELINE.map((t, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-step">{t.step}</div>
              <div className="timeline-content">
                <div className="timeline-title">{t.title}</div>
                <div className="timeline-desc">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Models */}
      <div className="about-section">
        <h2 className="about-section-title">Models Used</h2>
        <div className="models-grid-about">
          {MODELS_INFO.map((m, i) => (
            <div key={i} className="model-about-card">
              <div className="model-about-header">
                <span className="model-about-name">{m.name}</span>
                <span className="model-about-acc">{m.acc}</span>
              </div>
              <div className="model-about-desc">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="about-section">
        <h2 className="about-section-title">Tech Stack</h2>
        <div className="skills-grid">
          {SKILLS.map((s, i) => (
            <div key={i} className="skill-card">
              <div className="skill-category">{s.category}</div>
              <div className="skill-items">
                {s.items.map((item, j) => (
                  <span key={j} className="skill-tag">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="about-footer-note">
        <p>
          Built by <strong>Ashutosh Sarin & Team</strong> · 
          Powered by React, Flask & scikit-learn · 
          Data from OpenWeatherMap API
        </p>
        <a
          href="https://www.linkedin.com/in/ashutosh-sarin-4b366a371/"
          target="_blank"
          rel="noopener noreferrer"
          className="about-linkedin-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Connect on LinkedIn
        </a>
      </div>

    </div>
  );
}