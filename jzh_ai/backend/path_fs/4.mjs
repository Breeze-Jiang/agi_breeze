import fs from 'fs/promises'
// es6 es8
//解决回调地狱问题
//then 链式调用 爬楼梯 
//es8 async/await 语法糖
//立即执行函数 IFEE
//异步的 它只是语法糖 不是fs.readFileSync
//await 帮我们实现了流程控制,不需要手动处理then 链式
// 同步 -> js单线程,耗时性任务 (block) -> 异步(event loop) -> callback(回调) -> 流程控制 业务复杂(回调地狱) -> promise.then -> 略显复杂 -> async/await(es8 语法糖) 异步代码同步化(可读性) -> 本质还是promise ,异步中的微任务,setTimeout是宏任务
(async ()=>{
  console.log('开始读取文件')
  const data1 = await fs.readFile('./file1.txt','utf-8')
  console.log(`读取file1.txt 成功 ${data1}`)
  const data2 = await fs.readFile('./file2.txt','utf-8')
  console.log(`读取file2.txt 成功 ${data2}`)
  const data3 = await fs.readFile('./file3.txt','utf-8')
  console.log(`读取file3.txt 成功 ${data3}`)
})();
// fs.readFile('./file1.txt','utf-8')
//  .then(data=>{   //callback 优雅 then 语义好理解
//   console.log(`读取file1.txt 成功 ${data}`)
//   // promise实例 
//   // then 返回的是promise ,继续then 链式调用
//   return fs.readFile('./file2.txt','utf-8') //在then 中返回promise 实例 ,继续then 链式调用
//  })
//  .then(data=>{
//   console.log(`读取file2.txt 成功 ${data}`)
//   return fs.readFile('./file3.txt','utf-8')
//  })
//  .then(data=>{
//   console.log(`读取file3.txt 成功 ${data}`)
//  })