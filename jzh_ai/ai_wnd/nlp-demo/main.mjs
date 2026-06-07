// //主程序文件
// //多个默认的输出a,b... {对象 key:value}
// //解构语法
// import client, {a, b} from './client.mjs';
// console.log(client);
// // let {name, age} = {"name":"james","age":"20"};
// //console.log(name, age);
// let obj = {"name":"james","age":"20"};
// // let name = obj.name;
// // let age = obj.age;
// // 解构赋值 从对象中提取属性值，赋值给变量，代码优雅简洁，性能好
// let {name, age} = obj;
// console.log(name, age);
// // name obj.name 的区别 性能差异
// // es6让js成为js 大型项目企业级开发语言
// // 数组的解构，按顺序解构，...rest余下的全部解构
// let [coach,...players] = ['f','y','m','t'];
// console.log(coach, players);
// let [] = []
//入口文件 简洁

import { getCompletion, getImage } from './completions.mjs';

async function main() {
  const prompt = '请用一句话解释什么是模块化编程';
  const response = await getCompletion(prompt);
  console.log(response);
}

main();