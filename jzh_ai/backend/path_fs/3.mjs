// fs FileSystem 是文件系统模块,用于操作文件和目录
import fs from 'fs'//没加 /promise 不直接启用promise
// I/O 操作
// 同步读取文件操作 会阻塞后续代码执行 线程阻塞
// 简单粗暴 性能问题比较差
// js单线程 充斥着异步 高性能解决方案
//node 和前端环境不一样 可异步（node的优势） 可同步
//node 异步无阻塞 no block 
// node c++ 写出来的（fs，path ，暴露给js代码） 封装了v8引擎的文件系统模块(解析js)
// Node省很多服务器
// const syncData = fs.readFileSync('./test.txt','utf-8')
// console.log(syncData)
// 异步 跳过，先执行后面的，将回调函数放入事件循环 event loop
// 控制流程
// es6之前的老方法 回调函数
// 回调函数处理异步有缺陷(回调地狱),es6 通过Promise.then 解决

// fs.readFile('./test.txt','utf-8',(err,data)=>{
//   //node 第一个参数是err 错误对象 
//   if(!err){
//     console.log(data)
//   }else{
//     console.log(err)
//   }
// })
// console.log('后续代码')

// 先读取file1.txt 再读取file2.txt 再读取file3.txt

// js异步任务 流程控制越来越复杂, callback hell 回调地狱
fs.readFile('./file1.txt','utf-8',(err,data)=>{
  if(!err){
    console.log(`读取file1.txt 成功 ${data}`)
  }else{
    console.log(`读取file1.txt 失败 ${err}`)
  }
  // 读取file2.txt
  fs.readFile('./file2.txt','utf-8',(err,data)=>{
    if(!err){
      console.log(`读取file2.txt 成功 ${data}`)
    }else{
      console.log(`读取file2.txt 失败 ${err}`)
    }
    // 读取file3.txt
    fs.readFile('./file3.txt','utf-8',(err,data)=>{
      if(!err){
        console.log(`读取file3.txt 成功 ${data}`)
      }else{
        console.log(`读取file3.txt 失败 ${err}`)
      }
    })
  })
})