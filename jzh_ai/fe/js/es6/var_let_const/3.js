// 常量一开始就要赋值
const key = 'abc123'
// 简单数据类型时
let a; //undefined
let points = 50;
points = "100";
//let 不只是值可以改变，还可以改变类型
//但是不建议这么干
// 复杂数据类型 对象 
// 值可以改变，但是类型不行
const person = {
  name: 'zhangsan',
  age: 18
}
person.age = 'a';
console.log(person);