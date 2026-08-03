# 流式输出

- Agent 开发时代 
  - Agent 越来越像人，走向AGI
  - 如何将工作拆分，将AI擅长的交给Agent，我们审核，不擅长的我们接管
    - 项目工程初始化交给Agent
    1. 没有必要从0 开始写vue 项目
      src/App.vue
      index.html
    2. 到github 拉取一个模版项目

- 热更新 hot reload
  开发阶段的利器 vite
  文件修改 -> 刷新页面 -> 丢失页面状态 -> 局部刷新
  vue/react 数据状态 密密麻麻

- stream返回的是二进制流
  Uint8Array []
  // 0-255 编码 
  可以拆开理解：

  部分 含义 Uint Unsigned Integer，无符号整数 8 8 位，也就是 1 个字节 Array 数组

  所以 Uint8Array 的意思是：
   一个专门存放 0 到 255 之间整数的数组。
  为什么是 0 到 255？

  因为 1 个字节 = 8 bit：2^8 = 256
  范围就是：0 ~ 255
 ## 流式输出
 ### 后端返回数据流
 - 二进制文本流
 - \n 换行符 每个数据（data：）块一行结束
 兼顾响应速度和传输的效率
 llm 生成的token时候返回json格式
 llm再生成一些token，json 格式化 
 一次性发送的data：不确定的，一行，也可能是2到3行
 - data:{} json格式文本 completion 差不多的结构
 出错 数据包一定的大小
 try{

 }catch(err){
  //出错 不能扔掉
  小一段接着要 接着发送给后面的部分
 }