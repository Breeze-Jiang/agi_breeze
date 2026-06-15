// Node 内置的http模块
//早期的js没有模块化系统
// function scr
// Node 一定要上模块化方案 require + module.exports
// esm 是升级版的 import + export default
// require node 早期的模块化系统 commonjs
const http = require('http');
//伺服状态
http.createServer((req,res) => {
  //用户服务函数
  const todos = [{
    id: 1,
    title: '学习esm',
    completed: true
  },{
    id: 2,
    title: '学习es6',
    completed: false
  }]
  
  //req 用户对象
  if(req.url === '/'){
    res.end("hellow world");
  }
  if(req.url === '/todos'){
    //二进制文本
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type','application/json;charset=utf-8');
    res.end(JSON.stringify(todos));
  }
}).listen(3000,()=>{
  console.log(`server is running at port 3000`);
})