import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "antd/dist/reset.css";
import "./index.css";

import App from "./App";
import AppProviders from "./app/AppProviders";

// Chặn các lỗi ngoại lai phát sinh từ Chrome Extension (như Urban VPN...) làm hiện màn hình đỏ của React
if (typeof window !== "undefined") {
  window.addEventListener(
    "error",
    (event) => {
      if (
        event.filename?.includes("chrome-extension://") ||
        event.message?.includes("M_ID")
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true,
  );

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      const msg = String(event.reason?.message || event.reason || "");
      const stack = String(event.reason?.stack || "");
      if (
        msg.includes("M_ID") ||
        stack.includes("chrome-extension://")
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true,
  );
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <AppProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProviders>
  </React.StrictMode>,
);
