// 任务资源
// ts = js + 强类型
//自定义类型对象 接口
//面向对象核心概念 区别于对象字面量
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  // 任务创建时间
  createdAt: Date;
}
//资源 用http协议向外暴露
const todos: Todo[] = [ //约束数组中的元素必须符合Todo类型
  {
    id: '1',
    title: '学习ts',
    completed: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    title: '学习js',
    completed: true,
    createdAt: new Date(),
  }
];
//内置了高性能的http服务器
const server = Bun.serve({
  port:8080,//127.0.0.1:8080
  // ip 对应一台服务器，不同的端口 提供不同的服务
  //http 服务 ，mail 服务，ftp 服务
  // http server 处于伺服状态 http 是请求req响应response协议
  //用户通过浏览器输入url 去发送一个请求（req对象 可以有n个）
  // server fetch 函数 bun.serve() 的内置方法 所有的请求都会在这里处理
  async fetch(req: Request) {
    //异步任务，控制流程 await
    console.log(req);
    //http://域名:端口/路径/查询参数?a=1&b=2 查询字符串
    const url = new URL(req.url);//用户访问的地址
    return new Response(JSON.stringify(todos));
  }
});