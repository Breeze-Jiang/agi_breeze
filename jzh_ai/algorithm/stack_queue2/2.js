//怎么拿到栈顶元素 peek 方法 stack[stack.length -1]
const stack = []; //空栈
stack.push("dongbeidaban");
stack.push("keaiduo");
stack.push("binggongchang");

//出栈的代码
while(stack.length > 0){
  const top = stack[stack.length -1];
  console.log("出栈的:",top);
  stack.pop();
}

console.log(stack);
