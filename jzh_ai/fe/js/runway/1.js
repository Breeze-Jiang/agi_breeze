// javascript 执行机制对于开发者来说，至关重要
// 了解代码是怎么执行的
showName('fl');
console.log(showName);

var myName = 'fl';
function showName(name){
  console.log(name,"函数执行",name);
}