//promise es6 用于异步任务控制的最佳机制 
const p = new Promise((resolve, reject) => {
  //放置耗时性任务的
  console.log('start');
  setTimeout(() => {
    resolve('success');
    reject('error');//耗时性的异步任务，没有履约
  }, 1000);
});
console.log(p.__proto__);
p.then(() => {
  console.log('end');
}).catch(() => {
  console.log('error');
})