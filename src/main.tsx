import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

console.log(import.meta.env.PROD, import.meta.env.MODE);

// Initialize GA4 - ideally check if the ID exists and maybe only in production
if (GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
  console.log("GA Initialized");
} else {
  console.warn(
    "GA Measurement ID not found. Analytics will not be initialized.",
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
