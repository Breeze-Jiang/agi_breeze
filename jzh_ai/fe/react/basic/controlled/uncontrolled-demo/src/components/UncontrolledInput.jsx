import {
  useRef
} from 'react';



function UncontrolledInput() {
  const inputRef = useRef(null);
  function handleClick() {
    const inputValue = inputRef.current.value;
    console.log(inputValue);
  }
  return (
    <>
      Uncontrolled Input
      <input type="text" ref={inputRef} placeholder="请输入" />
      <button onClick={handleClick}>获取输入值</button>
    </>
  );
}
export default UncontrolledInput;
