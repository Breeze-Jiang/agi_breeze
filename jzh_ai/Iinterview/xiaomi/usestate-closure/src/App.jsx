import { useState, useEffect } from 'react';
    
const App = () => {
  const [count, setCount] = useState(0);   // ① 本地状态，初始 0

  useEffect(() => {                        // ② 挂载时执行一次（依赖是 []）
    const timer = setInterval(() => {      // ③ 每秒执行一次
      // setCount(count + 1);                 // ④ 问题就在这行
      setCount((prevCount) => prevCount + 1);
    }, 1000);

    return () => clearInterval(timer);     // ⑤ 卸载时清理定时器
  }, []);

  return <div>Count: {count}</div>         // ⑥ 显示当前 count
}