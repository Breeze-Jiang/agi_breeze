// v8 引擎看来
//声明提升
var myuname //变量提升 undefined
function showName(name){
  console.log("函数执行");
}

showName();
console.log(myuname);
myuname = 'fl';