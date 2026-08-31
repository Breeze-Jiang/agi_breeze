// node 早期的commonjs规范
import http from 'node:http';
const http = require('http');
const server = http.createServer((req, res) => {
  res.end('hello world');
});
server.listen(3000, 'localhost', () => {
  console.log('server is running on port 3000');
});