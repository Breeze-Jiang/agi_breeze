interface Animal {
  name: string;
}
// 接口属性可以分头多次定义，合并
interface Animal {
  age: number;
}

const dog: Animal = {
  name: '旺财',
  age: 1,
}
// 类型名相同冲突
// type AnimalType = {name:string}
// type AnimalType = {age:number} // 错误