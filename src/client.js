const { sleep, md5 } = require('./utils');

class EnergyGridClient {
  constructor(options) {
    this.baseUrl = options.baseUrl;
    this.token = options.token;
    this.rateLimitMs = options.rateLimitMs || 1000;
    this.batchSize = options.batchSize || 10;
    this.maxRetries = options.maxRetries || 3;
    this.lastRequestAt = 0;
    this.endpointPath = '/device/real/query';
  }

  buildUrl() {
    return `${this.baseUrl.replace(/\/$/, '')}${this.endpointPath}`;
  }

  buildSignature(path, timestamp) {
    return md5(`${path}${this.token}${timestamp}`);
  }

  async waitForRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequestAt;
    if (elapsed < this.rateLimitMs) {
      await sleep(this.rateLimitMs - elapsed);
    }
  }

  async postBatch(serialNumbers) {
    const url = this.buildUrl();
    let attempt = 0;

    while (true) {
      await this.waitForRateLimit();
      const timestamp = Date.now().toString();
      const signature = this.buildSignature(this.endpointPath, timestamp);

      this.lastRequestAt = Date.now();

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            signature,
            timestamp
          },
          body: JSON.stringify({
            sn_list: serialNumbers
          })
        });

        if (response.status === 429) {
          throw new RateLimitError('Rate limited by server');
        }

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        attempt += 1;
        if (attempt > this.maxRetries) {
          throw error;
        }

        const backoffMs = Math.min(1000 * 2 ** (attempt - 1), 8000);
        await sleep(backoffMs);
      }
    }
  }
}

class RateLimitError extends Error {}

module.exports = {
  EnergyGridClient,
  RateLimitError
};
