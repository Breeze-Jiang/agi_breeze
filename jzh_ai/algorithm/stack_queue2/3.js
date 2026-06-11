const queue = [];// 空队列
queue.push("dongbeidaban");
queue.push("keaiduo");
queue.push("binggongchang");

console.log(queue);

//出队的代码
while(queue.length > 0){
  const front = queue[0];
  console.log("出队的:",front);
  queue.shift();
}

console.log(queue);