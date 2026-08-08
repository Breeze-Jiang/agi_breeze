import {
  useRef,
  useEffect,
  useState
} from 'react'


const App = () => {
  // 为组件的渲染 挂载让路 
 const workerRef = useRef(null); // 可持久化的可变对象
 const [result, setResult] = useState(null);
 const [loading, setLoading] = useState(false);
  useEffect(() => {
    // 开启一个worker 线程 开销比较大的
    // ref 引用了worker 线程。
    workerRef.current = new Worker(
      new URL("../worker.js", import.meta.url)
    );
    // 监听worker 线程的消息 有没有消息到达
    workerRef.current.onmessage = (e) => {
      console.log(e);
      console.log("---------------------")
      const {result} = e.data;
      setResult(result);
      setLoading(false);
    }
    // 组件卸载时， 关闭worker 线程
    return () => {
      workerRef.current.terminate();
      workerRef.current = null; // 手动回收
    }

  }, [])
  // 主线程
  // 离开主线程？ 开辟新的线程
  // console.time('主线程')
  // // 循环1000000 次
  // for(let i = 0; i < 1000000; i++){
  //   console.log(i)
  // }
  // console.timeEnd('主线程')

  const startHeavyCalc = () => {
    setLoading(true);
    // 消息机制
    workerRef.current.postMessage({
      num:88
    })
  }
  return (
    <div style={{padding: '30px'}}>
      <h2>useRef + WebWorker 耗时运算</h2>
      <p>开启web worker 线程 执行五亿次计算，结束后通知主线程</p>
      <button onClick={startHeavyCalc} disabled={loading}>{loading?"正在后台计算":"启动繁重计算任务"}</button>
      {result && <h3>计算结果：{result}</h3>}
    </div>
  )
}



export default App
