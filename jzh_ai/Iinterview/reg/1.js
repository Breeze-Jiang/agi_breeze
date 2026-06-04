let str="13888888888";
//描述一个匹配的规则
//一个字符一个字符的匹配
//[]表示匹配的字符范围
// let reg=/1[3-9]{9}/;
let reg=/^1[3-9]\d{9}$/;
console.log(Object.prototype.toString.call([reg]));
console.log(typeof {});
console.log(typeof reg);
console.log(reg.test(str));