<script setup lang="ts">
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { onMounted, ref } from "vue";

const mapContainer = ref<HTMLElement | null>(null);

onMounted(() => {
	mapboxgl.accessToken =
		"pk.eyJ1IjoiZmlzdG1lbmFydXRvIiwiYSI6ImNsOHJtZzlrZTBucXAzbm4xeDQ1N29lbXcifQ.5DrUh4lgXkHcv6x3hyyTjw";
	console.log(mapContainer.value);
	const map = new mapboxgl.Map({
		container: mapContainer.value!,
		style: "mapbox://styles/mapbox/streets-v11",
		center: [25.2, 54.7],
		zoom: 3,
		projection: {
			name: "globe",
		},
	});
	map.on("load", () => {
		map.setFog({}); // Set the default atmosphere style
	});
});
</script>

<template>
	<div ref="mapContainer" class="w-full h-full"></div>
</template>

<style>
html,
body,
#app {
	width: 100%;
	height: 100%;
}
</style>
