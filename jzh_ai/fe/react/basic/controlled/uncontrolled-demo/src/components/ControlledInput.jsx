import { useState } from 'react';
// 受控组件 响应式状态控制input
// 收集用户输入


function ControlledInput() {
  const [value, setValue] = useState('');
  return (
    <>
      Controlled Input
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="请输入" />
    </>
  );
}
export default ControlledInput;