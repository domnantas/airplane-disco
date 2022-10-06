import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Unocss from "unocss/vite";
import { presetUno, transformerDirectives } from "unocss";
import presetDaisy from "unocss-preset-daisy";

export default defineConfig({
	plugins: [
		vue(),
		Unocss({
			transformers: [transformerDirectives()],
			presets: [presetUno(), presetDaisy()],
		}),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
