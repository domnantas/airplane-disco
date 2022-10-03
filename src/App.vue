<script setup lang="ts">
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { onMounted, ref } from "vue";
import { featureCollection, point } from "@turf/turf";

const mapContainer = ref<HTMLElement | null>(null);

onMounted(() => {
	mapboxgl.accessToken =
		"pk.eyJ1IjoiZmlzdG1lbmFydXRvIiwiYSI6ImNsOHJtZzlrZTBucXAzbm4xeDQ1N29lbXcifQ.5DrUh4lgXkHcv6x3hyyTjw";
	const map = new mapboxgl.Map({
		container: mapContainer.value!,
		style: "mapbox://styles/mapbox/streets-v11",
		center: [25.2, 54.7],
		zoom: 3,
		projection: {
			name: "globe",
		},
	});

	map.on("load", async () => {
		map.setFog({}); // Set the default atmosphere style

		const flights = await fetch(
			"https://opensky-network.org/api/states/all"
		).then((response) => response.json());

		const flightsCollection = featureCollection(
			flights.states
				.filter((flight: any) => flight[5] && flight[6])
				.map((flight: any) => point([flight[5], flight[6]]))
		);

		map.addSource("flights", {
			type: "geojson",
			// @ts-ignore
			data: flightsCollection,
		});

		map.addLayer({
			id: "flights",
			type: "symbol",
			source: "flights",
			layout: {
				"icon-image": "airport-15",
				"icon-allow-overlap": true,
			},
		});
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
