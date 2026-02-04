const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    name: 'EnergyGrid-Data-Aggregator',
    status: 'ok',
    time: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
