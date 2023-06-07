import { createTheme } from "@nextui-org/react";
import { colors } from "./colors";

export const light = createTheme({
  className: "light-theme",
  type: "light",
  theme: {
    colors: colors.light, // optional
  },
});

export const dark = createTheme({
  className: "dark-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.dark,
    },
  },
});

export const sky = createTheme({
  className: "sky-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.sky,
    },
  },
});

export const skyLight = createTheme({
  className: "sky-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.sky },
  },
});

export const arctic = createTheme({
  className: "arctic-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.arctic,
    },
  },
});

export const arcticLight = createTheme({
  className: "arctic-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.arctic },
  },
});

export const azure = createTheme({
  className: "azure-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.azure,
    },
  },
});

export const azureLight = createTheme({
  className: "azure-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.azure },
  },
});

export const iris = createTheme({
  className: "iris-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.iris,
    },
  },
});

export const irisLight = createTheme({
  className: "iris-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.iris },
  },
});

export const flamingo = createTheme({
  className: "flamingo-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.flamingo,
    },
  },
});

export const flamingoLight = createTheme({
  className: "flamingo-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.flamingo },
  },
});

export const coral = createTheme({
  className: "coral-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.coral,
    },
  },
});

export const coralLight = createTheme({
  className: "coral-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.coral },
  },
});

export const marine = createTheme({
  className: "marine-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.marine,
    },
  },
});

export const marineLight = createTheme({
  className: "marine-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.marine },
  },
});

export const ocean = createTheme({
  className: "ocean-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.ocean,
    },
  },
});

export const oceanLight = createTheme({
  className: "ocean-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.ocean },
  },
});

export const fluid = createTheme({
  className: "fluid-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.fluid,
    },
  },
});

export const fluidLight = createTheme({
  className: "fluid-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.fluid },
  },
});

export const galaxy = createTheme({
  className: "galaxy-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.galaxy,
    },
  },
});

export const galaxyLight = createTheme({
  className: "galaxy-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.galaxy },
  },
});

export const cosmos = createTheme({
  className: "cosmos-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.cosmos,
    },
  },
});

export const cosmosLight = createTheme({
  className: "cosmos-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.cosmos },
  },
});

export const andromeda = createTheme({
  className: "andromeda-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.andromeda,
    },
  },
});

export const andromedaLight = createTheme({
  className: "andromeda-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.andromeda },
  },
});
