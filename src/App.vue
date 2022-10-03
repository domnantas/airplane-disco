<script setup lang="ts">
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { onMounted, ref } from "vue";
import { featureCollection, point } from "@turf/turf";
import type { FeatureCollection } from "geojson";

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

		const flightsCollection: FeatureCollection = featureCollection(
			flights.states
				.filter((flight: any) => flight[5] && flight[6])
				.map((flight: any) =>
					point([flight[5], flight[6]], {
						velocity: flight[9],
						trueTrack: flight[10],
					})
				)
		);

		map.addSource("flights", {
			type: "geojson",
			data: flightsCollection,
		});

		map.addLayer({
			id: "flights",
			type: "symbol",
			source: "flights",
			layout: {
				"icon-image": "airport-15",
				"icon-allow-overlap": true,
				"icon-rotate": ["get", "trueTrack"],
				"icon-rotation-alignment": "map",
			},
		});

		// setInterval(() => {
		// 	flightsCollection = featureCollection(
		// 		featureReduce(
		// 			// @ts-ignore
		// 			flightsCollection,
		// 			(updatedFeatures, currentFeature) => {
		// 				const velocityKilometersPerSecond =
		// 					(currentFeature.properties?.velocity || 0) / 1000;
		// 				const bearing = currentFeature.properties?.trueTrack || 0;

		// 				const movedFeature = destination(
		// 					getCoords(currentFeature),
		// 					velocityKilometersPerSecond,
		// 					bearing,
		// 					{ properties: currentFeature.properties }
		// 				);
		// 				return [...updatedFeatures, movedFeature];
		// 			},
		// 			[]
		// 		)
		// 	);

		// 	map
		// 		.getSource("flights")
		// 		// @ts-ignore
		// 		.setData(flightsCollection);
		// }, 1000);
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
