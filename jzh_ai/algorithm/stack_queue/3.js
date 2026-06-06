// 早期的js没有class，约定大写构造函数
function Greeting(name) {
  console.log('实例化',this);
  this.name = name;
}
Greeting.prototype.say = function(){
  console.log(`${this.name} 你好`);
}
Greeting.prototype.work = function(){
  console.log(`${this.name} 工作`);
}
const greeting = new Greeting('q');
console.log(greeting);
console.log(greeting.name);
greeting.say();
greeting.work();
// console.log(new Greeting('q'));
