// commonjs , import esm
const http = require('http'); // node 内置http 模块 
const fs = require('fs'); // node fs 模块

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const readStream = fs.createReadStream('./index.html');
    readStream.on('error', (err) => {
      res.writeHead(500, {
        'Content-Type': 'text/plain'
      });
      res.end('Internal Server Error');
    });
    res.writeHead(200, {
      'Content-Type': 'text/html'
    });
    readStream.pipe(res);
  } else if (req.url === '/stream') {
    res.writeHead(200, {
      'Content-Type': "text/event-stream",
      'Cache-control': 'no-cache',
      'Connection': 'keep-alive',
    });
    let words = ["你", "好", ", ", "欢", "迎", "了", "解", "sse"];
    let index = 0;
    const timer = setInterval(() => {
      if (index >= words.length) {
        clearInterval(timer);
        res.end(); // 关闭连接
        return;
      }
      // sse 格式发送
      res.write(`data: ${words[index]}\n\n`);
      index++;
    }, 1000)
  }
})

server.listen(3000, () => {
  console.log('server is running on port 3000');
})