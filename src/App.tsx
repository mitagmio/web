import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Loading, NextUIProvider } from "@nextui-org/react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { en, ru } from "locales";

import { AppContext, AppProvider } from "./contexts";
import {
  dark,
  light,
  sky,
  skyLight,
  arctic,
  arcticLight,
  azure,
  azureLight,
  iris,
  irisLight,
  flamingo,
  flamingoLight,
  coral,
  coralLight,
  marine,
  marineLight,
  ocean,
  oceanLight,
  fluid,
  fluidLight,
  galaxy,
  galaxyLight,
  cosmos,
  cosmosLight,
  andromeda,
  andromedaLight,
} from "./themes";
import { Layout } from "./components";
import { Home, Events, OurTeam, RoadMap, Analytics, Export } from "./pages";
import NotFound from "./NotFound";

import "react-loading-skeleton/dist/skeleton.css";
import "keen-slider/keen-slider.min.css";
import "./assets/index.scss";
import { Suspense, useContext, useMemo } from "react";
import { Wallet } from "pages/Wallet";

const queryClient = new QueryClient();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ru: {
        translation: ru,
      },
    },

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "events",
        element: <Events />,
      },
      {
        path: "roadmap",
        element: <RoadMap />,
      },
      {
        path: "team",
        element: <OurTeam />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
      {
        path: "analytics/price/:id",
        element: <Analytics />,
      },
      {
        path: "analytics/volume/:ID",
        element: <Analytics />,
      },
      {
        path: "wallet/:ID",
        element: <Wallet />,
      },
    ],
  },
  {
    path: "/export/:id",
    element: <Export />,
  },
  {
    path: "*",
    element: <Layout />,
    children: [
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function App() {
  const { theme, enabled } = useContext(AppContext);
  const themeName = useMemo(
    () =>
      theme
        ? `${theme.color}${!enabled ? "Light" : ""}`
        : enabled
        ? "dark"
        : "light",
    [theme, enabled]
  );
  const values = useMemo(
    () => ({
      light,
      dark,
      sky,
      skyLight,
      arctic,
      arcticLight,
      azure,
      azureLight,
      iris,
      irisLight,
      flamingo,
      flamingoLight,
      coral,
      coralLight,
      marine,
      marineLight,
      ocean,
      oceanLight,
      fluid,
      fluidLight,
      galaxy,
      galaxyLight,
      cosmos,
      cosmosLight,
      andromeda,
      andromedaLight,
    }),
    []
  );

  return (
    <ThemeProvider
      enableSystem
      disableTransitionOnChange
      forcedTheme={themeName}
      themes={[
        "light",
        "dark",
        "sky",
        "skyLight",
        "arctic",
        "arcticLight",
        "azure",
        "azureLight",
        "iris",
        "irisLight",
        "flamingo",
        "flamingoLight",
        "corral",
        "corralLight",
        "marine",
        "marineLight",
        "ocean",
        "oceanLight",
        "fluid",
        "fluidLight",
        "galaxy",
        "galaxyLight",
        "cosmos",
        "cosmosLight",
        "andromeda",
        "andromedaLight",
      ]}
      value={Object.keys(values).reduce((acc, curr) => {
        acc[curr] = values[curr].className;

        return acc;
      }, {})}
    >
      <NextUIProvider theme={values[themeName]}>
        <Suspense fallback={<Loading />}>
          {!globalThis ? <Loading /> : <RouterProvider router={router} />}
        </Suspense>
      </NextUIProvider>
    </ThemeProvider>
  );
}

export default () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <App />
    </AppProvider>
  </QueryClientProvider>
);
