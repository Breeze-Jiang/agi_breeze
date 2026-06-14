// 表示空或者没有
//null
//primitive 原始 内存空间固定
let a = null;
let b = a;
b = 2;
console.log(a);
console.log(b);

let obj = {
  name: 'zhansan',
  address: null
}
let obj2 = obj;
obj2.company = 'alibaba';
console.log(obj,obj2);
// console.log(obj.address);
// console.log(obj.age);

// let largeObject = {
//   data:new Array(1000000).fill("hgh")
// }
// //手动回收
// largeObject = null;
// console.log(largeObject);
