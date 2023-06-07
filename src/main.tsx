import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Spinner } from "@nextui-org/react";

import "./assets/index.scss";
import "./patch-local-storage-for-github-pages";

const App = lazy(() => import("./App"));

window.global = window;

createRoot(document.getElementById("root") as any).render(
  <Suspense fallback={<Spinner />}>
    <App />
  </Suspense>
);
