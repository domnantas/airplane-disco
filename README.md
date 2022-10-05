# Airplane Disco ✈️🪩

[Airplane Scatter](https://en.wikipedia.org/wiki/Airplane_scatter) prediction calculator

## Development

Project is split to 2 services - **airplane-client** and **airplane-server**. Refer to each service README for more details. tl;dr to launch project locally:

Get an API key from [ADS-B Exchange](https://www.adsbexchange.com/free-aircraft-scatter-data-via-rapidapi/) and put it in `airplane-server/.dev.vars.example`

Copy `airplane-client/.env.example` to `airplane-client/.env.local`

Launch server:
```sh
cd airplane-server

# Set Node version
n auto

# Install dependencies
npm install

# Run server
npm run dev
```

Launch client:
```sh
cd airplane-client

# Install dependencies
npm install

# Run client
npm run dev
```
