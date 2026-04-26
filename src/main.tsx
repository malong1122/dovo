import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router";
import App from "./App.tsx";
import PvApp from "./pv/PvApp.tsx";
import "./index.css";

const navStyle: React.CSSProperties = {
  position: "fixed",
  top: 12,
  left: 12,
  zIndex: 99999,
  display: "flex",
  gap: 8,
  pointerEvents: "auto",
};

const btnBase: React.CSSProperties = {
  padding: "4px 12px",
  fontSize: 11,
  borderRadius: 4,
  cursor: "pointer",
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.25)",
  color: "rgba(255,255,255,0.5)",
  background: "rgba(0,0,0,0.35)",
  backdropFilter: "blur(4px)",
  letterSpacing: 1,
};

const btnActive: React.CSSProperties = {
  ...btnBase,
  color: "#fff",
  borderColor: "rgba(255,255,255,0.6)",
  background: "rgba(0,0,0,0.6)",
};

function Nav() {
  return (
    <nav style={navStyle}>
      <NavLink to="/" end style={({ isActive }) => (isActive ? btnActive : btnBase)}>
        牛羊肉产业
      </NavLink>
      <NavLink to="/pv" style={({ isActive }) => (isActive ? btnActive : btnBase)}>
        光伏帮扶
      </NavLink>
    </nav>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pv" element={<PvApp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
