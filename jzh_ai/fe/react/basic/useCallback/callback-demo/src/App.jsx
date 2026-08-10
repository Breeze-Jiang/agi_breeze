import { 
  useState,
  memo
 } from 'react';




const RegularChild = memo(function RegularChild({name}) {
  console.log('RegularChild 组件渲染');
  return (
    <>
      <h1>当前名字: {name}</h1>
    </>
  );
});

function App() {
  console.log('App 组件渲染');
  const [count, setCount] = useState(0);
  const [name, setName] = useState('少林队');
  return (
    <>
      <h1>当前计数: {count}</h1>
      <button onClick={()=>setCount(count+1)}>增加</button>
      <button onClick={()=>setName('峨眉队')}>改变名字</button>
      <RegularChild name={name} />
    </>
  );
}


export default App;