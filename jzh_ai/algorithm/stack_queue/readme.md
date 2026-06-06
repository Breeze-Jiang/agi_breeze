# 如何用栈模拟队列

线性
 栈 队列 链表 
非线性 
 树
- 栈 stack
  FILO 先进后出
- 队列 queue
  FIFO 先进先出

push(x) 将一个元素放入队列的尾部
pop() 从队列的头部移除一个元素
peek() 返回队列的头部元素
empty() 返回队列是否为空

## js的面向对象
- 不走寻常路
  不需要class 也可以完成面向对象
  函数也是对象，是一等对象
  普通函数
   this 全局对象
  new + 构造函数 可以实例化对象
   this 指向新创建的对象
   new + 构造函数运行时，this 指向不断完成
   对象属性的创建
  原型式的面向对象
   js 没有类，只有对象 MyQueue 对象
   MyQueue.prototype 也是一个对象
  class 对象 prototype 原型对象

## new的过程
- 创建一个空对象，this指向新创建的对象
- 构造函数执行，this上添加属性，实例也就有了这些属性
- 构造函数有一个protoype属性，指向原型对象
  原型对象上有的方法，实例也会有这些方法

## js 设计哲学
- 一切皆是对象，没有类
- Object 是顶层对象
  按照原型式的面向对象来设计
  Object() 函数对象
  Object.prototype 原型对象
  let obj = {} 相当于 new Object()
  Function，Array，Data等都是函数对象
  下一站 Object 原型链

- 实例对象都有__proto__私有属性，指向原型对象
- 沿着__proto__链，一直查找，沿着原型链查找，终点是null
- 任何函数有prototype属性，指向原型对象
  负责给实例提供共享方法
- 原型对象上有constructor属性，指向构造函数
- 实例先在自身查找属性，再沿着原型链查找属性或方法
- 任何对象，要不原型直接就是Object.prototype，要不终点前一定是Object.prototype











  Person {}
4.html:30 Person {name: 'zwy', age: 18}
4.html:31 仁义礼智信
4.html:24 hello my name iszwy
4.html:27 timeMF
4.html:34 [object Object]
zwy
Person {name: 'zwy', age: 18}
zwy.__proto__
{poem: '仁义礼智信', say: ƒ, timeMF: ƒ}
zwy.__proto__.constructor
ƒ Person (name, age) {
      // 构造实例的，实例私有的
      console.log(this);
      this.name = name;
      this.age = age;
    }
zwy.__proto__.__proto__
{__defineGetter__: ƒ, __defineSetter__: ƒ, hasOwnProperty: ƒ, __lookupGetter__: ƒ, __lookupSetter__: ƒ, …}constructor: ƒ Object()hasOwnProperty: ƒ hasOwnProperty()isPrototypeOf: ƒ isPrototypeOf()propertyIsEnumerable: ƒ propertyIsEnumerable()toLocaleString: ƒ toLocaleString()toString: ƒ toString()valueOf: ƒ valueOf()__defineGetter__: ƒ __defineGetter__()__defineSetter__: ƒ __defineSetter__()__lookupGetter__: ƒ __lookupGetter__()__lookupSetter__: ƒ __lookupSetter__()__proto__: (...)get __proto__: ƒ __proto__()set __proto__: ƒ __proto__()
zwy.__proto__.__proto__ === Object.prototype
true
zwy.__proto__.__proto__ === Object
false
zwy.__proto__ === Person
false
zwy.__proto__ === Person.prototype
true
zwy.__proto__ === Person.prototype
true
zwy.__proto__.__proto__
{__defineGetter__: ƒ, __defineSetter__: ƒ, hasOwnProperty: ƒ, __lookupGetter__: ƒ, __lookupSetter__: ƒ, …}
zwy.__proto__.__proto__.__proto__
null