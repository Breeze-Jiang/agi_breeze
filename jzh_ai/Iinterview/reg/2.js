const str='价格是100元,进价是80元,赚了20元';
const reg=/\d+/g;
// console.log(reg.test(str));
const res=str.match(reg);
console.log(res);
