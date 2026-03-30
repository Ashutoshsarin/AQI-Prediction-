import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Predict from "./pages/Predict";
import ModelComparison from "./pages/ModelComparison";
import EDA from "./pages/EDA";
import DatasetInfo from "./pages/DatasetInfo";
import About from "./pages/About";
import "./App.css";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/predict" element={<Predict />} />
            <Route path="/models"  element={<ModelComparison />} />
            <Route path="/eda"     element={<EDA />} />
            <Route path="/dataset" element={<DatasetInfo />} />
            <Route path="/about"   element={<About />} />
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}