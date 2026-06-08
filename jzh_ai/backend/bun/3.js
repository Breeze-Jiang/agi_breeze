// 如何封装sleep函数

function sleep(ms) {
  //es6 提供的解决异步问题的api 许下诺言
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
async function main(){
  console.log("--start--");
  //await 后面接受一个Promise对象
  await sleep(2000);//将异步任务同步化
  console.log("--end--");
}
main();