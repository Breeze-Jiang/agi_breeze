//局部作用域 global scope 
var height = 100;
function setWidth(){
  var width = 100;
  console.log(width,height);
}

setWidth();

var age = 100;
if(age > 12){
  // 块级作用域
  //es6 常量 不可以重新赋值，只能声明一次
  const dog = age * 7;
  // 如果是var，可以在块级作用域外访问
  // var dog = age * 7;
  let x = 200;
  console.log(dog);
}
console.log(dog);