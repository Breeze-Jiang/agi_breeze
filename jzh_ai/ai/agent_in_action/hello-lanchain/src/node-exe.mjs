// node 主进程 agent的执行  js 单线程
// 调用工具去执行命令行任务(分离，独立的子进程)
// node 是一个多进程架构
// 子进程
// child_process 做完之后，IPC（进程间的通信 Inner process Communcation）告诉主进程
// 子进程 
import {spawn} from 'node:child_process';//启动一个子进程
//mini cursor I/O， 命令行
//agent tool 实现自动化
const command = 'pnpm init vite react-todo-app --template react-ts';// 列出所有文件，包括隐藏文件 command linux 命令 shell 脚本
//切一下，第一项 cmd 命令，rest运算符 所有参数数组 
const [cmd, ...args] = command.split(' ');
const cwd = process.cwd();//当前工作目录
// 启动一个新的子进程 
console.log( cwd);
const client = spawn(cmd, args,{
  cwd: cwd,//工作目录
  // node运行会申请这个资源，
  // bash 也会申请这个资源 
  // 子进程继承父进程的输入输出 直接显示在当前控制台
  stdio:'inherit',//命令
  shell:true,
});

let errorMsg = '';
client.on('error', (err) => {
  errorMsg = err.message;
});
client.on('close', (code) => {
  if(code === 0){//后端返回0 成功
    process.exit(0);//退出 主进程
  }else{
    if(errorMsg){
      console.error(`错误：${errorMsg}`);
    }
    process.exit(code || 1);
  }
});