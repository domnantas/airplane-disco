export interface Env {
	AIRCRAFT_SCATTER_API_KEY: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const requestUrl = new URL(request.url);
		const latitude = requestUrl.searchParams.get("latitude");
		const longitude = requestUrl.searchParams.get("longitude");

		const airplanePositions = await fetch(
			`https://aircraftscatter.p.rapidapi.com/lat/${latitude}/lon/${longitude}/`,
			{
				headers: {
					"X-RapidAPI-Key": env.AIRCRAFT_SCATTER_API_KEY,
					"X-RapidAPI-Host": "aircraftscatter.p.rapidapi.com",
				},
			}
		).then((response) => response.json());

		return new Response(JSON.stringify(airplanePositions), {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"content-type": "application/json;charset=UTF-8",
			},
		});
	},
};
