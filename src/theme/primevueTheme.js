import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

export const appPrimeVuePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{sky.50}",
      100: "{sky.100}",
      200: "{sky.200}",
      300: "{sky.300}",
      400: "{sky.400}",
      500: "{sky.500}",
      600: "{sky.600}",
      700: "{sky.700}",
      800: "{sky.800}",
      900: "{sky.900}",
      950: "{sky.950}",
    },
    colorScheme: {
      light: {
        surface: {
          0: "#ffffff",
          50: "{slate.50}",
          100: "{slate.100}",
          200: "{slate.200}",
          300: "{slate.300}",
          400: "{slate.400}",
          500: "{slate.500}",
          600: "{slate.600}",
          700: "{slate.700}",
          800: "{slate.800}",
          900: "{slate.900}",
          950: "{slate.950}",
        },
        primary: {
          color: "{sky.600}",
          contrastColor: "#ffffff",
          hoverColor: "{sky.700}",
          activeColor: "{sky.800}",
        },
        highlight: {
          background: "{sky.50}",
          focusBackground: "{sky.100}",
          color: "{sky.700}",
          focusColor: "{sky.800}",
        },
        focusRing: {
          color: "{sky.500}",
        },
        formField: {
          hoverBorderColor: "{sky.400}",
          focusBorderColor: "{sky.500}",
        },
      },
      dark: {
        surface: {
          0: "#020617",
          50: "{slate.950}",
          100: "{slate.900}",
          200: "{slate.800}",
          300: "{slate.700}",
          400: "{slate.600}",
          500: "{slate.500}",
          600: "{slate.400}",
          700: "{slate.300}",
          800: "{slate.200}",
          900: "{slate.100}",
          950: "{slate.50}",
        },
        primary: {
          color: "{sky.400}",
          contrastColor: "#020617",
          hoverColor: "{sky.300}",
          activeColor: "{sky.200}",
        },
        highlight: {
          background: "rgba(14, 165, 233, 0.16)",
          focusBackground: "rgba(14, 165, 233, 0.24)",
          color: "{sky.100}",
          focusColor: "#ffffff",
        },
        focusRing: {
          color: "{sky.400}",
        },
        formField: {
          hoverBorderColor: "{sky.500}",
          focusBorderColor: "{sky.400}",
        },
      },
    },
  },
});
