import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";       // IMPORTANT: exact file name
import "./App.css";              // IMPORTANT: exact file name

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
