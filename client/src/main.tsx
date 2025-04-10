import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.title = "EcoSnap - 60-Second Sustainability Stories";

createRoot(document.getElementById("root")!).render(<App />);
