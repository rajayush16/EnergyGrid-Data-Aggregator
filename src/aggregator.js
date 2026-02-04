const { chunkArray } = require('./utils');

function generateSerialNumbers(count) {
  return Array.from({ length: count }, (_, index) => {
    const suffix = index.toString().padStart(3, '0');
    return `SN-${suffix}`;
  });
}

async function aggregateTelemetry(client, serialNumbers) {
  const batches = chunkArray(serialNumbers, client.batchSize);
  const results = {};
  const rawResponses = [];
  const errors = [];

  const start = Date.now();

  for (let i = 0; i < batches.length; i += 1) {
    const batch = batches[i];
    try {
      const response = await client.postBatch(batch);
      rawResponses.push({ index: i, batch, response });

      const items = response?.data || response?.devices || response?.result || [];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          const key = item.serialNumber || item.serial || item.sn;
          if (key) {
            results[key] = item;
          }
        });
      }
    } catch (error) {
      errors.push({ index: i, batch, message: error.message });
    }
  }

  const end = Date.now();

  return {
    summary: {
      requested: serialNumbers.length,
      batches: batches.length,
      received: Object.keys(results).length,
      errors: errors.length,
      durationMs: end - start
    },
    bySerial: results,
    rawResponses,
    errors
  };
}

module.exports = {
  generateSerialNumbers,
  aggregateTelemetry
};
