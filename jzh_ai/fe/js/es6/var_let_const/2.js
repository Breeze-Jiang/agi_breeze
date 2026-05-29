// 全局作用域
{
  // 块级作用域
  //声明了变量，属于当前块级作用域
  const name = 'zhangsan';
  console.log(name);
}
// 推出了循环，才是10
for (let i = 0; i < 10; i++) {
  // 同步代码 尽快执行完
  // 异步代码 1秒后执行完 i已经变成了10
  console.log(i);
  setTimeout(function(){
    console.log(`this number is ${i}`);
  }, 1000);
  // setTimeout(() => {
  //   console.log(i);
  // }, 1000);
}