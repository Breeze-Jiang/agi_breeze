// node的内置模块
import path from 'path';
//join 路径拼接 比较简陋 正确性待验证
// console.log(path.join('a', 'b', 'c', '123.js'))
//根目录 ，src/，assets/静态资源
// console.log(path.join(process.cwd(), '/hello', '123.js'))
// console.log(path.resolve(process.cwd(), '/hello', '123.js'))
// console.log(path.resolve('a','b','c'))
console.log(path.resolve('/a/b/c','123.js','../a','b'))
console.log(path.resolve('/a/b/c','123.js','./a','b'))
console.log(path.resolve('/a/b/c','123.js','/a','b'))
console.log(path.resolve('/a/b/c','123.js','a','b'))
// 运行结果：
// C:\a\b\c\a\b
// C:\a\b\c\123.js\a\b
// C:\a\b
// C:\a\b\c\123.js\a\b