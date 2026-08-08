// 不可以做DOM api 自己的api
console.log('worker 线程启动了')
// self 关键字
self.onmessage = (e) => {
  console.log("收到主线程的消息",e.data);
  const {num} = e.data;
  let sum = 0;
  for(let i = 0; i < 5000000000; i++){
    sum += num * i;
  }
  // 回复主线程
  self.postMessage({result: sum});
}