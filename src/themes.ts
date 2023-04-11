import { createTheme } from "@nextui-org/react";
import { colors } from "./colors";

export const light = createTheme({
  type: "light",
  theme: {
    colors: colors.light, // optional
  },
}).className;

export const dark = createTheme({
  type: "dark",
  theme: {
    colors: colors.dark, // optional
  },
}).className;

export const sky = createTheme({
  className: "sky",
  type: "dark",
  theme: {
    colors: colors.sky,
  },
});

export const skyLight = createTheme({
  className: "sky-light",
  type: "light",
  theme: {
    colors: colors.sky,
  },
});

export const arctic = createTheme({
  className: "arctic",
  type: "dark",
  theme: {
    colors: colors.arctic,
  },
}).className;

export const arcticLight = createTheme({
  className: "arctic-light",
  type: "light",
  theme: {
    colors: colors.arctic,
  },
}).className;

export const azure = createTheme({
  className: "azure",
  type: "dark",
  theme: {
    colors: colors.azure,
  },
}).className;

export const azureLight = createTheme({
  className: "azure-light",
  type: "light",
  theme: {
    colors: colors.azure,
  },
}).className;

export const iris = createTheme({
  className: "iris",
  type: "dark",
  theme: {
    colors: colors.iris,
  },
}).className;

export const irisLight = createTheme({
  className: "iris-light",
  type: "light",
  theme: {
    colors: colors.iris,
  },
}).className;

export const flamingo = createTheme({
  className: "flamingo",
  type: "dark",
  theme: {
    colors: colors.flamingo,
  },
}).className;

export const flamingoLight = createTheme({
  className: "flamingo-light",
  type: "light",
  theme: {
    colors: colors.flamingo,
  },
}).className;

export const coral = createTheme({
  className: "coral",
  type: "dark",
  theme: {
    colors: colors.coral,
  },
}).className;

export const coralLight = createTheme({
  className: "coral-light",
  type: "light",
  theme: {
    colors: colors.coral,
  },
}).className;

export const marine = createTheme({
  className: "marine",
  type: "dark",
  theme: {
    colors: {
      white: "#000",
      ...colors.marine,
    },
  },
}).className;

export const marineLight = createTheme({
  className: "marine-light",
  type: "light",
  theme: {
    colors: colors.marine,
  },
}).className;

export const ocean = createTheme({
  className: "ocean",
  type: "dark",
  theme: {
    colors: colors.ocean,
  },
}).className;

export const oceanLight = createTheme({
  className: "ocean-light",
  type: "light",
  theme: {
    colors: colors.ocean,
  },
}).className;

export const fluid = createTheme({
  className: "fluid",
  type: "dark",
  theme: {
    colors: {
      white: "#000",
      ...colors.fluid,
    },
  },
}).className;

export const fluidLight = createTheme({
  className: "fluid-light",
  type: "light",
  theme: {
    colors: { ...colors.fluid, primary: "#008c50" },
  },
}).className;

export const galaxy = createTheme({
  className: "galaxy",
  type: "dark",
  theme: {
    colors: colors.galaxy,
  },
}).className;

export const galaxyLight = createTheme({
  className: "galaxy",
  type: "light",
  theme: {
    colors: colors.galaxy,
  },
}).className;

export const cosmos = createTheme({
  className: "cosmos",
  type: "dark",
  theme: {
    colors: colors.cosmos,
  },
}).className;

export const cosmosLight = createTheme({
  className: "cosmos-light",
  type: "light",
  theme: {
    colors: colors.cosmos,
  },
}).className;

export const andromeda = createTheme({
  className: "andromeda",
  type: "dark",
  theme: {
    colors: colors.andromeda,
  },
}).className;

export const andromedaLight = createTheme({
  className: "andromeda-light",
  type: "light",
  theme: {
    colors: colors.andromeda,
  },
}).className;
