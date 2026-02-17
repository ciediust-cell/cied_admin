import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { installAuthFetchInterceptor } from "./app/lib/authFetchInterceptor.ts";
import "./styles/index.css";

installAuthFetchInterceptor();

createRoot(document.getElementById("root")!).render(<App />);
