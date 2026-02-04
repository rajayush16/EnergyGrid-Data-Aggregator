const fs = require('fs');
const path = require('path');
const { EnergyGridClient } = require('./client');
const { generateSerialNumbers, aggregateTelemetry } = require('./aggregator');

const BASE_URL = process.env.ENERGYGRID_BASE_URL || 'http://localhost:3000';
const TOKEN = process.env.ENERGYGRID_TOKEN || 'interview_token_123';
const OUTPUT_PATH = process.env.OUTPUT_PATH || path.join(process.cwd(), 'output.json');

async function main() {
  const client = new EnergyGridClient({
    baseUrl: BASE_URL,
    token: TOKEN,
    rateLimitMs: 1000,
    batchSize: 10,
    maxRetries: 3
  });

  const serialNumbers = generateSerialNumbers(500);

  console.log(`Fetching telemetry for ${serialNumbers.length} devices...`);

  const report = await aggregateTelemetry(client, serialNumbers);

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

  console.log(`Done. Saved report to ${OUTPUT_PATH}`);
  console.log(`Summary: ${JSON.stringify(report.summary)}`);
}

main().catch((error) => {
  console.error('Aggregation failed:', error);
  process.exit(1);
});
