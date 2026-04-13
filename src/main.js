import "./styles/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import "primeicons/primeicons.css";

import App from "./App.vue";
import router from "./router";
import { appPrimeVuePreset } from "./theme/primevueTheme";

const app = createApp(App);

app.use(createPinia());
app.use(PrimeVue, {
  theme: {
    preset: appPrimeVuePreset,
    options: {
      darkModeSelector: ".app-dark",
    },
  },
  ripple: true,
});
app.use(router);

app.mount("#app");
