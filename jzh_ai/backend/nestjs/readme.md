# nestjs 

next.js 全栈 ， nestjs 就是node 的纯后端企业级开发框架。
默认使用typescript，全面模块化思想

## 后端开发做些什么？
- 提供api 接口web开发
- 系统集成，并发，顶层服务，AI infra
- 微服务
## 安装
npm i -g @nestjs/cli
npm new my-nest
npm run start

## 目录架构
- src
  main.ts
  app.module.ts 根模块
## 工厂模式
## 高度模块化


- 完整调用链路图
浏览器访问 http://localhost:3000
        ↓
main.ts 的 app.listen(3000) 接收请求
        ↓
NestJS 路由匹配：GET /
        ↓
找到 AppController（由 AppModule 注册）
        ↓
AppController 的 @Get() 装饰器匹配
        ↓
调用 getHello() 方法
        ↓
console.log('/ 的控制器')  ← 打印
        ↓
调用 this.appService.getHello()
        ↓
AppService.getHello() 返回 'Hello World!'
        ↓
Controller 返回给浏览器
        ↓
浏览器显示 Hello World!





## 装饰器模式 
装饰器模式在不修改原有对象的前提下，动态添加额外功能
@

## 开发流程
AppModule import 里面植入我们的Module
Module 是nestjs 的独立业务模块
  xx.module.ts  定义和组装
  @Injectable()  自动依赖注入
  自动注入controller 或任何用它的地方
  controller 里的一个属性
  MVC 本质 分层
  装饰器模式用到极致

- 
nestjs内置的错误类
请说下你是如何处理后端报错的？
try catch finnaly ts 独苗 线程挂了
nest.js 提供了各种错误类，标准化错误输出
status code状态码
message 消息
