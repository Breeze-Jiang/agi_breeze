// 现代前端开发框架
// .vue -> .tsx 组件化 typecript + jsx 语法
// 响应式
// 数据绑定
import { useState,
  useEffect// 生命周期钩子函数 组件挂载时执行
  } from 'react'
// import 'app.css'
import Progress from './components/progress'
function App(){
  //数据状态驱动界面状态， 设计
  //变/常量 -> 数据（数据绑定）
  // 不需要dom 编程  ->  数据状态（响应式，调用第二个函数，修改状态， 界面会跟着变）
  //数据不同状态 -> 界面不同状态 
  // null初始值 ，loading 加载中 ready  llm准备好了
  const [input, setInput] = useState('')
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)
  // 加载信息
  const [loadingMessage, setLoadingMessage] = useState("开始加载")
  const [progressItem, setProgressItem] = useState([

  ]) 

  const onEnter = () => {
    
  }
  // const [progressItem, setProgressItem] = useState([{
  //   text:'model.onnx',
  //   percentage:0,
  //   total:123456
  // },{
  //   text:'model2.onnx',
  //   percentage:10,
  //   total:123456
  // }])
//组件生命周期  副作用 ：组件挂载只有，附带着做什么
  useEffect(() => {
    console.log('挂载完成')

  }, [])
// 浏览器 导航栏 是否支持 WebGPU 加速
//现在浏览器的重要特性 !! 表示是否为真
// ！取反  navigator.gpu 不支持时 undefined
// ！! 再取反，一定可以成 true | false 不需要判断是否为 undefined
  const IS_WEBGPU_AVAILABLE = !!navigator.gpu;
  console.log('组件函数执行')
  //js 脚本 数据逻辑交互
  // 返回 html jsx
  // 修改count， setcount 
  const [count, setCount] = useState(0) //响应式
  return (
    // flex-direction:column; 主轴在垂直方向 ,h-screen 高度占满全屏, mx-auto margin x 水平居中对齐
    // 原子类，组合一下
    IS_WEBGPU_AVAILABLE?(<div className = "flex flex-col h-screen mx-auto items-center justify-end text-gray-800 bg-white">
      <div className = "h-full overflow-auto flex justify-center items-center flex-col relative">
        <div className = "flex flex-col items-center mb-1 max-w-[400px] text-center">
          {/* []代表指定样式大小 */}
          <h1 className="text-4xl font-bold mb-1">Deepseek R1 WebGPU Demo</h1>
          <h2 className="font-semibold">a next generation reasoning model that run locally in your browser with WebGPU acceleration</h2>
        </div>
        <div className="flex flex-col items-center px-4 ">
          <p className="mx-w-[510px] mb-4"><br />you are about to load the model,
          <a href="https://huggingface.co/onnx-community/DeepSeek-R1-Distill-Qwen-1.5B-ONNX"target="_blank" rel="noreferrer" className="font-medium underline">
              {/* DeepSeek-R1 的 15 亿参数量蒸馏版，用 Qwen 架构，适合本地轻量推理。
                蒸馏Qwen reasoning 推理模型
                hugging face 抱抱脸 全球最大开源模型社区
              */}
          DeepSeek-R1-Distill-Qwen-1.5B
          </a>
          , a 1.5B parameter reasoning LLM optimized for in-browser
          inference. Everything runs entirely in your browser with
          <a
              href="https://huggingface.co/docs/transformers.js"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              🤗&nbsp;Transformers.js
            </a>{" "}
            {/* Open Neural Network Exchange */}
            and ONNX Runtime Web, meaning no data is sent to a server. Once
            loaded, it can even be used offline. The source code for the demo
            is available on{" "}
          </p>
          {
            // 报错界面状态， 响应式
            error && (<div className="text-red-500 text-center mb-2"><p className="mb-1">unable to load model due to error:</p><p className="text-sm">{error}</p></div>)
          }
          {/* vue 添加事件 @click  react onclick 不要去发明  大佬的骄傲 */}
          <button className="border px-4 py-2 rounded-lg bg-blue-400 text-white hover:bg-blue-500 disabled:cursor-not-allowed select-none" disabled = {status !== null || error !== null} onClick={() => {
            setStatus('loading')
          }}>Load Model</button>
        </div>
      </div>
      {
        //loading 状态 llm 加载中
        status === "loading" && ( 
          // tailwindcss 适配方便的 
          <div className="w-full max-w-[500px] text-left mx-auto p-4 bottom-0 mt-auto">
            <p className="text-center mb-1">
              {loadingMessage}
            </p>
            {
              progressItem.map(({text,percentage,total},i) => (
                //自闭和标签
                // app的子组件
                <Progress key={i} text={text} percentage={percentage} total={total} />
              ))
            }
          </div> 
        )
      }
      {/* 聊天输入框 */}
      <div className = "mt-2 border border-gray-300 rounded-lg w-[600px] max-w-[80%] max-h-[200px] mx-auto relative mb-3 flex ">
        {/* react 不支持双向绑定 */}
        <textarea className="w-[550px] dark:text-gray-700 px-3 py-4 rounded-lg bg-transparent border-none outline-none disabled:text-gray-400 disabled:placeholder-gray-200"  placeholder="type your question" rows={1} disabled={status !== 'ready'} value ={input} 
        onInput={(e) => {
          // e.target 事件对象上target 属性一定有 不一定有 value 属性
          // ts
          // 断言 敢于断定  as 是 ts的关键字 
          // e 是通用的事件对象
          // e.target 通用的事件目标对象 不一定有value 
          const target = e.target as HTMLTextAreaElement
          setInput(target.value)
        }} 
        onKeyDown={(e) => {
          if(input.length > 0 && e.key === 'Enter' && !e.shiftKey){
            e.preventDefault()// 阻止默认事件
            onEnter();
          }
        }} title={status ==='ready'?'model is ready':'model not loaded' }></textarea>
      </div>
    </div>):(<div>您的浏览器不支持 WebGPU 加速，请升级浏览器或使用其他浏览器</div>)
  )
}

export default App