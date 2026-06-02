// .env 文件中的apikey 读取进来
// dotenv 是一个零依赖的模块，可以将环境变量从 .env 文件加载到 process.env 中
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
// process 进程对象是一个全局变量，提供有关当前 Node.js 进程的信息，并对其进行控制。
// 进程是操作系统的核心概念，比如node index.mjs 运行时，node 进程就会被创建，process.env 就是这个进程的环境变量对象，可以通过它来访问环境变量。进程是分配资源的最小单位
// process.env 是一个对象，包含了系统环境变量和用户定义的环境变量。通过 process.env 可以访问这些变量，比如 process.env.DEEPSEEK_API_KEY 就可以获取到 .env 文件中定义的 DEEPSEEK_API_KEY 的值。
// console.log(process.env, process.env.DEEPSEEK_API_KEY);
// 函数表达式
//async 修饰符 表示函数是异步的 函数内部可以使用 await 来等待异步操作的结果，函数会返回一个 Promise 对象
const client = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/v1'
    });
//省略funtion 关键字，箭头函数
const main = async () => {
    console.log('程序开始运行');
    const response = await client.chat.completions.create({
        model:'deepseek-chat',
        messages:[
            {
                role:'user',
                content:'你好，你是什么大模型'
            }
        ]
    })
    console.log(response.choices[0].message.content);
    // setTimeout(function() {
    //     console.log('1秒后执行的代码');
    // }, 1000);
    console.log('程序结束运行');
}
main();