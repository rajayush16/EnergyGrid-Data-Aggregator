# EnergyGrid-Data-Aggregator

Client app to fetch telemetry for 500 solar inverters from the EnergyGrid API while respecting strict rate limits and signing requirements.

## Requirements
- Node.js 18+ (uses built-in `fetch`)
- Mock API running locally (see `mock-api/README.md` in the provided server folder)

## Setup
```bash
npm install
```

## Run
```bash
npm start
```

## Configuration
Environment variables (optional):
- `ENERGYGRID_BASE_URL` (default `http://localhost:3000`)
- `ENERGYGRID_TOKEN` (default `interview_token_123`)
- `OUTPUT_PATH` (default `./output.json`)

## What it does
- Generates 500 serial numbers: `SN-000` to `SN-499`
- Batches requests in groups of 10
- Enforces 1 request/second rate limit
- Signs each request with `MD5(URL + Token + Timestamp)`
- Retries on 429/network errors with exponential backoff
- Aggregates responses into a single report saved to `output.json`

## Notes
- The client sends `Token`, `Timestamp`, and `Signature` headers plus a JSON body with `token` and `serialNumbers`.
- If the mock server expects slightly different field names, adjust them in `src/client.js`.
