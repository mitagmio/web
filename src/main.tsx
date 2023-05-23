import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./assets/index.scss";
import "./patch-local-storage-for-github-pages";
import { Spinner } from "@nextui-org/react";

const App = lazy(() => import("./App"));

window.global = window;

createRoot(document.getElementById("root") as any).render(
  <StrictMode>
    <Suspense fallback={<Spinner />}>
      <App />
    </Suspense>
  </StrictMode>
);
