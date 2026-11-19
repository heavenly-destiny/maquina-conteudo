import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import MarcaPrev from "./Marca.prev";

history.scrollRestoration = "manual";
// app atualizado com a página aberta: os pedaços antigos somem e a tela ficava em branco. Recarrega uma vez sozinho.
addEventListener("vite:preloadError", (ev) => {
  ev.preventDefault();
  try { if (sessionStorage.getItem("recarregou") === "1") return; sessionStorage.setItem("recarregou", "1"); } catch { /* sem storage */ }
  location.reload();
});
addEventListener("load", () => setTimeout(() => { try { sessionStorage.removeItem("recarregou"); } catch { /* */ } }, 5000));
createRoot(document.getElementById("root")!).render(<StrictMode>{location.search.includes("marca") ? <MarcaPrev /> : <App />}</StrictMode>);
