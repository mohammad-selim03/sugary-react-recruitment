import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { RouterProvider } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <RouterProvider> */}
      <App />
    {/* </RouterProvider> */}
  </StrictMode>
);
