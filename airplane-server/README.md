# Airplane Server

This service uses [Cloudflare Workers](https://workers.cloudflare.com/) and [Typescript](https://www.typescriptlang.org/). Right now it is simply proxying requests to [ADS-B Exchange](https://www.adsbexchange.com/)

## Development

Copy `.dev.vars.example` to `.dev.vars`.

Get an API key from [ADS-B Exchange](https://www.adsbexchange.com/free-aircraft-scatter-data-via-rapidapi/). You'll have to register on [RapidAPI](https://rapidapi.com) and subscribe to the API.

Update `AIRCRAFT_SCATTER_API_KEY` in `.dev.vars`

Launch server:
```sh
# Install dependencies
npm Install

# Run server
npm run dev
```
