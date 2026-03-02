import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            duration: 4000,
            style: { fontFamily: "Inter, system-ui, sans-serif" },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

