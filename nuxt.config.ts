// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],
  runtimeConfig: {
    aircraftScatterApiKey: "",
  },
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
});
