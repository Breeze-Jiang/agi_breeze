const obj = {
  'bytedance':['AI全栈开发','Agent 工程师'],
  'teencent':['后端开发','Agent 工程师'],
  '163':['前端开发','Agent 工程师']
}

// for (let key in obj){
//   console.log(key)
// }

// Object.entries() 把 对象 变成 二维数组 ，方便用 for...of 一个个拿出来。
for (let [key,value] of Object.entries(obj)){
  console.log(key,value)
}