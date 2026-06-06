// 类 MyQueue
// 早期的js没有类
// js是基于原型的面向对象
// 不需要class也可以完成面向对象
// 用函数模拟类 函数 + prototype
// 类是抽象的 一套属性+方法的模板
// js开发比较快 
const MyQueue = function () {                 // 函数表达式
  // 构造函数，属性
  console.log('实例化',this);
  this.stack1 = [];
  this.stack2 = [];
}
// new 关键字实例化对象 this 指向新创建的对象
// 构造函数 return 语句没有返回值时，默认返回新创建的对象
MyQueue.prototype.push = function(){
  console.log('push方法');
}
const queue = new MyQueue();
console.log(queue,queue.push());
