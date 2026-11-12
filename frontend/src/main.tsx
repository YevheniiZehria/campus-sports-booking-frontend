import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import App from "./App";
import "./index.css";

// Punctul de intrare principal al aplicației React 19
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Elementul rădăcină #root nu a fost găsit în document.");
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
