import { NavLink } from "react-router-dom";
import "./Navbar.css";

const links = [
  { to: "/",        label: "Dashboard",   icon: "▣" },
  { to: "/models",  label: "Model Arena", icon: "◈" },
  { to: "/eda",     label: "Analytics",   icon: "◫" },
  { to: "/dataset", label: "Dataset",     icon: "▤" },
  { to: "/about",   label: "About",       icon: "◍" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="brand-icon">
            <span className="brand-icon-inner" />
          </div>
          <span className="brand-text">
            AQI<span className="brand-accent">Analytics</span>
          </span>
        </div>

        <ul className="navbar-links">
          {links.map(l => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">{l.icon}</span>
                <span className="nav-label">{l.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-badge">
          <span className="live-dot" />
          <span>6 Models Active</span>
        </div>
      </div>
    </nav>
  );
}