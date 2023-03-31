<script setup lang="ts">
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl, { Marker, GeoJSONSource, LngLat } from "mapbox-gl";
import { onMounted, ref } from "vue";
import {
	circle,
	featureCollection,
	getCoord,
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

const transmitterPosition = ref<LngLat>();
const stationsDrawerIsOpen = ref(true);

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

	const transmitterMarker = new Marker({
		draggable: true,
	}).on("drag", (event) => {
		transmitterPosition.value = event?.target?.getLngLat();
	});

	const receiverMarker = new Marker({
		draggable: true,
		color: "red",
	});

	map.once("click", (event) => {
		transmitterPosition.value = event.lngLat;
		transmitterMarker.setLngLat(event.lngLat).addTo(map);

		map.once("click", async (event) => {
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

			const pathMidpoint = midpoint(
				transmitterMarker.getLngLat().toArray(),
				receiverMarker.getLngLat().toArray()
			);

			map.addSource("midpoint", {
				type: "geojson",
				data: circle(pathMidpoint, 20),
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

			const airplaneCollection = await getAirplaneCollection(
				getCoord(pathMidpoint)[1],
				getCoord(pathMidpoint)[0]
			);

			const airplaneSource = map.getSource("airplanes") as GeoJSONSource;
			airplaneSource.setData(airplaneCollection);

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

			transmitterMarker.on("dragend", async () => {
				const pathMidpoint = midpoint(
					transmitterMarker.getLngLat().toArray(),
					receiverMarker.getLngLat().toArray()
				);

				const airplaneCollection = await getAirplaneCollection(
					getCoord(pathMidpoint)[1],
					getCoord(pathMidpoint)[0]
				);

				const airplaneSource = map.getSource("airplanes") as GeoJSONSource;
				airplaneSource.setData(airplaneCollection);
			});

			receiverMarker.on("dragend", async () => {
				const pathMidpoint = midpoint(
					transmitterMarker.getLngLat().toArray(),
					receiverMarker.getLngLat().toArray()
				);

				const airplaneCollection = await getAirplaneCollection(
					getCoord(pathMidpoint)[1],
					getCoord(pathMidpoint)[0]
				);

				const airplaneSource = map.getSource("airplanes") as GeoJSONSource;
				airplaneSource.setData(airplaneCollection);
			});

			setInterval(async () => {
				const airplaneCollection = await getAirplaneCollection(
					getCoord(pathMidpoint)[1],
					getCoord(pathMidpoint)[0]
				);

				const airplaneSource = map.getSource("airplanes") as GeoJSONSource;
				airplaneSource.setData(airplaneCollection);
			}, 10000);
		});
	});
});
</script>

<template>
	<div ref="mapContainer" class="w-full h-full"></div>

	<div
		class="z-10 fixed w-9/12 max-w-xs top-4 bottom-4 left-0 bg-white border-r border-gray-200 rounded-r-lg dark:border-gray-700 dark:bg-gray-800 transition-transform p-4"
		:class="{
			'-translate-x-full': !stationsDrawerIsOpen,
		}"
	>
		<button
			class="absolute left-full top-1/2 -translate-y-1/2 bg-white border-r border-t border-b border-gray-200 rounded-r-lg dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white p-4 focus:outline-none"
			@click="stationsDrawerIsOpen = !stationsDrawerIsOpen"
		>
			<p
				:style="{
					writingMode: 'vertical-lr',
				}"
			>
				Stations
			</p>
		</button>
		<h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
			TX station
		</h2>
		<label
			for="my-position"
			class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
			>Position</label
		>
		<input
			type="text"
			id="my-position"
			class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			placeholder="XXYYzz..."
			:value="transmitterPosition?.toArray()"
		/>

		<hr class="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" />

		<h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
			RX Station
		</h2>
		<label
			for="dx-position"
			class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
			>Position</label
		>
		<input
			type="text"
			id="dx-position"
			class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			placeholder="XXYYzz..."
		/>
	</div>
</template>

<style>
html,
body,
#app {
	width: 100%;
	height: 100%;
}
</style>
