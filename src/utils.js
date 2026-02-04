const crypto = require('crypto');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function md5(value) {
  return crypto.createHash('md5').update(value).digest('hex');
}

module.exports = {
  sleep,
  chunkArray,
  md5
};
