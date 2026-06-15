// 唯一的表示符 symbol,用函数创建的,简单数据类型
//轻松表达独一无二
console.log(Symbol('symbol'));
console.log(Symbol('symbol') === Symbol('symbol'));
console.log(typeof Symbol('symbol'));
console.log(Symbol());//绝对唯一,可以传一个唯一label
let obj = {
  [Symbol('symbol')]: 'symbol',
  prop: 'property',
};