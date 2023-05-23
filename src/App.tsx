import { createBrowserRouter, RouterProvider } from "react-router-dom";
import useDarkMode from "use-dark-mode";
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
import {
  Home,
  Countdown,
  OurTeam,
  RoadMap,
  Analytics,
  AnalyticsPrice,
  AnalyticsVolume,
} from "./pages";
import NotFound from "./NotFound";
import Ton from "./Ton";

import "react-loading-skeleton/dist/skeleton.css";
import "keen-slider/keen-slider.min.css";
import "./assets/index.scss";
import { Suspense, useContext, useMemo } from "react";

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
        element: <Countdown />,
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
        path: "ton",
        element: <Ton />,
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
    ],
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
  const { theme } = useContext(AppContext);
  const darkMode = useDarkMode(true);

  const themeName = useMemo(
    () =>
      theme
        ? `${theme.color}${!darkMode.value ? "Light" : ""}`
        : darkMode.value
        ? "dark"
        : "light",
    [theme, darkMode.value]
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
      defaultTheme={themeName} //darkMode.value ? 'dark' : 'light'}
      attribute="class"
      forcedTheme={themeName} //theme ? `T${theme.split('#').pop()}` : 'dark'}
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
      value={values}
    >
      <NextUIProvider theme={values[themeName]}>
        <Suspense fallback={<Loading />}>
          <RouterProvider router={router} />
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
