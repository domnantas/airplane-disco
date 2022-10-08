<script setup lang="ts">
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl, { Marker, GeoJSONSource } from "mapbox-gl";
import { onMounted, ref } from "vue";
import {
	circle,
	featureCollection,
	greatCircle,
	midpoint,
	point,
} from "@turf/turf";
import type { FeatureCollection } from "geojson";

type AirplaneServerResponse = {
	ac: Airplane[];
	ctime: number;
	msg: string;
	now: number;
	ptime: number;
	total: number;
};

type Airplane = {
	alt_baro: number;
	alt_geom: number;
	baro_rate: number;
	category: string;
	dir: number;
	dst: number;
	geom_rate: number;
	gs: number;
	lat: number;
	lon: number;
	seen: number;
	seen_pos: number;
	track: number;
	track_rate: number;
	type: string;
};

const mapContainer = ref<HTMLElement | null>(null);

const getAirplanes = (
	latitude: number,
	longitude: number
): Promise<AirplaneServerResponse> => {
	const airplaneServerUrl = new URL(import.meta.env.VITE_AIRPLANE_PROXY_URL);
	airplaneServerUrl.searchParams.set("latitude", latitude.toString());
	airplaneServerUrl.searchParams.set("longitude", longitude.toString());

	return fetch(airplaneServerUrl.href).then((response) => response.json());
};

const getAirplaneCollection = async (
	latitude: number,
	longitude: number
): Promise<FeatureCollection> => {
	const airplanes = await getAirplanes(latitude, longitude);
	return featureCollection(
		airplanes.ac.map((airplane: Airplane) => {
			return point([airplane.lon, airplane.lat], {
				altitude: airplane.alt_geom,
				groundSpeed: airplane.gs,
				track: airplane.track,
			});
		})
	);
};

onMounted(async () => {
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

		const center = map.getCenter();
		const airplaneCollection = await getAirplaneCollection(
			center.lat,
			center.lng
		);

		map.addSource("airplanes", {
			type: "geojson",
			data: airplaneCollection,
		});

		map.addLayer({
			id: "airplanes",
			type: "symbol",
			source: "airplanes",
			layout: {
				"icon-image": "airport-15",
				"icon-allow-overlap": true,
				"icon-rotate": ["get", "track"],
				"icon-rotation-alignment": "map",
			},
		});
	});

	// map.on("moveend", async () => {
	// 	const center = map.getCenter();
	// 	const airplaneCollection = await getAirplaneCollection(
	// 		center.lat,
	// 		center.lng
	// 	);

	// 	const airplaneSource = map.getSource("airplanes") as mapboxgl.GeoJSONSource;
	// 	airplaneSource.setData(airplaneCollection);
	// });

	const receiverMarker = new Marker({
		draggable: true,
		color: "red",
	});

	const transmitterMarker = new Marker({
		draggable: true,
	});

	map.once("click", (event) => {
		transmitterMarker.setLngLat(event.lngLat).addTo(map);

		map.once("click", (event) => {
			receiverMarker.setLngLat(event.lngLat).addTo(map);

			map.addSource("path", {
				type: "geojson",
				data: greatCircle(
					transmitterMarker.getLngLat().toArray(),
					receiverMarker.getLngLat().toArray()
				),
			});

			map.addLayer({
				id: "path",
				type: "line",
				source: "path",
				paint: {
					"line-color": "#333",
					"line-width": 2,
				},
			});

			map.addSource("midpoint", {
				type: "geojson",
				data: circle(
					midpoint(
						transmitterMarker.getLngLat().toArray(),
						receiverMarker.getLngLat().toArray()
					),
					20
				),
			});

			map.addLayer({
				id: "midpoint",
				type: "fill",
				source: "midpoint",
				paint: {
					"fill-color": "red",
					"fill-opacity": 0.5,
				},
			});

			transmitterMarker.on("drag", () => {
				const pathSource = map.getSource("path") as GeoJSONSource;
				pathSource.setData(
					greatCircle(
						transmitterMarker.getLngLat().toArray(),
						receiverMarker.getLngLat().toArray()
					)
				);

				const midpointSource = map.getSource("midpoint") as GeoJSONSource;
				midpointSource.setData(
					circle(
						midpoint(
							transmitterMarker.getLngLat().toArray(),
							receiverMarker.getLngLat().toArray()
						),
						20
					)
				);
			});

			receiverMarker.on("drag", () => {
				const pathSource = map.getSource("path") as GeoJSONSource;
				pathSource.setData(
					greatCircle(
						transmitterMarker.getLngLat().toArray(),
						receiverMarker.getLngLat().toArray()
					)
				);

				const midpointSource = map.getSource("midpoint") as GeoJSONSource;
				midpointSource.setData(
					circle(
						midpoint(
							transmitterMarker.getLngLat().toArray(),
							receiverMarker.getLngLat().toArray()
						),
						20
					)
				);
			});
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
