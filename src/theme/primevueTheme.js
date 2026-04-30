import { definePreset } from "@primeuix/themes";
import Aura from "@primeuix/themes/aura";

export const appPrimeVuePreset = definePreset(Aura, {
  semantic: {
    primary: {
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
          color: "{slate.700}",
          contrastColor: "#ffffff",
          hoverColor: "{slate.800}",
          activeColor: "{slate.900}",
        },
        highlight: {
          background: "{slate.50}",
          focusBackground: "{slate.100}",
          color: "{slate.700}",
          focusColor: "{slate.800}",
        },
        focusRing: {
          color: "{slate.500}",
        },
        formField: {
          hoverBorderColor: "{slate.400}",
          focusBorderColor: "{slate.500}",
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
          color: "{slate.300}",
          contrastColor: "#020617",
          hoverColor: "{slate.200}",
          activeColor: "{slate.100}",
        },
        highlight: {
          background: "rgba(255, 255, 255, 0.12)",
          focusBackground: "rgba(255, 255, 255, 0.18)",
          color: "{slate.100}",
          focusColor: "#ffffff",
        },
        focusRing: {
          color: "{slate.400}",
        },
        formField: {
          hoverBorderColor: "{slate.500}",
          focusBorderColor: "{slate.400}",
        },
      },
    },
  },
});
