import * as dotenv from 'dotenv';
// node 里面最常用最简单的开发框架
// vite 启动的http server ,服务于前端 
// 5173 前端 -> 3000 bff 后端 -> deepseek
// 前端发送请求到 bff 服务 享受服务 web服务 后端 伺服状态 3000 端口 
import express from 'express';
//让key更安全
//纯前端 ， 右键看代码 ， 
// 前端可以通过fetch -> bff (apikey) -> llm 服务器
dotenv.config({path: ['.env', '.env.local']});
const app = express(); // server app
const port = 3000;
app.get('/', (req, res) => {
  //不断地流式输出
  res.send('Hello World!');//一次性发送 
});
// 流式输出 的bff层 让前端调用 
app.get('/stream', async (req, res) => {
  //prompt req 解析
  //fetch deepseek stream : ture 
  //llm 
  // console.log(req.query.request);
  // res.json({
  //   prompt: req.query.prompt,
  // })
  const {prompt} = req.query;
  const endpoint = 'https://api.deepseek.com/v1/chat/completions';
  const apiKey = process.env.VITE_DEEPSEEK_API_KEY;
  const model = 'deepseek-v4-flash';
  try{
    const response = await fetch(endpoint,{
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })
    console.log(response.body); // 流式输出
    // 流式输出 事件源
  }catch(error){
    console.error('Error:', error);
  }
});
app.listen(port, () => {
  console.log(`bff server is running on port ${port}`);
});
// 后端 轻量的 就这一个文件
// node server.mjs 运行后端进程
console.log('当前是一个藏在前端项目里面的bff');
// console.log('.env.local 中的 VITE_DEEPSEEK_API_KEY:', process.env.VITE_DEEPSEEK_API_KEY);
