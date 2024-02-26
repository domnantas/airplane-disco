// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: ["@nuxtjs/tailwindcss", "shadcn-nuxt"],
  runtimeConfig: {
    aircraft: "",
  },
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
});
