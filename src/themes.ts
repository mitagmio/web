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
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const sky = createTheme({
  className: "sky-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.sky,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const skyLight = createTheme({
  className: "sky-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.sky, background: "transparent" },
  },
});

export const arctic = createTheme({
  className: "arctic-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.arctic,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const arcticLight = createTheme({
  className: "arctic-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.arctic, background: "transparent" },
  },
});

export const azure = createTheme({
  className: "azure-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.azure,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const azureLight = createTheme({
  className: "azure-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.azure, background: "transparent" },
  },
});

export const iris = createTheme({
  className: "iris-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.iris,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const irisLight = createTheme({
  className: "iris-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.iris, background: "transparent" },
  },
});

export const flamingo = createTheme({
  className: "flamingo-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.flamingo,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const flamingoLight = createTheme({
  className: "flamingo-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.flamingo, background: "transparent" },
  },
});

export const coral = createTheme({
  className: "coral-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.coral,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const coralLight = createTheme({
  className: "coral-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.coral, background: "transparent" },
  },
});

export const marine = createTheme({
  className: "marine-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.marine,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const marineLight = createTheme({
  className: "marine-light-theme",
  type: "light",
  theme: {
    
    colors: { ...colors.marine, background: "transparent" },
  },
});

export const ocean = createTheme({
  className: "ocean-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.ocean,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const oceanLight = createTheme({
  className: "ocean-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.ocean, background: "transparent" },
  },
});

export const fluid = createTheme({
  className: "fluid-theme",
  type: "dark",
  theme: {
    colors: {
      white: "#000",
      ...colors.fluid,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const fluidLight = createTheme({
  className: "fluid-light-theme",
  type: "light",
  theme: {
    
    colors: { ...colors.fluid, background: "transparent" },
  },
});

export const galaxy = createTheme({
  className: "galaxy-theme",
  type: "dark",
  theme: {
    colors: {
      white: "#000",
      ...colors.galaxy,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const galaxyLight = createTheme({
  className: "galaxy-theme",
  type: "light",
  theme: {
    colors: { ...colors.galaxy, background: "transparent" },
  },
});

export const cosmos = createTheme({
  className: "cosmos-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.cosmos,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const cosmosLight = createTheme({
  className: "cosmos-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.cosmos, background: "transparent" },
  },
});

export const andromeda = createTheme({
  className: "andromeda-theme",
  type: "dark",
  theme: {
    colors: {
      ...colors.andromeda,
      background: "transparent",
      backgroundContrast: "rgb(0, 0, 0, 0.5)",
      primarySolidContrast: "$dark",
      secondarySolidContrast: "$dark",
    },
  },
});

export const andromedaLight = createTheme({
  className: "andromeda-light-theme",
  type: "light",
  theme: {
    colors: { ...colors.andromeda, background: "transparent" },
  },
});
