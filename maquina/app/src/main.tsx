import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import MarcaPrev from "./Marca.prev";

history.scrollRestoration = "manual";
createRoot(document.getElementById("root")!).render(<StrictMode>{location.search.includes("marca") ? <MarcaPrev /> : <App />}</StrictMode>);
