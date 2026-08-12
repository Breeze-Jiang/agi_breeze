interface User {
  name: string;
  age: number;
  avatarUrl: string;
}
type UserType ={
  name: string;
  age: number;
  avatarUrl: string;
}

const u1: User = {
  name: '张三',
  age: 18,
  avatarUrl: 'https://jzh.ai/avatar.png',
}
const u2: UserType = {
  name: '李四',
  age: 20,
  avatarUrl: 'https://jzh.ai/avatar.png',
}

interface Person {
  name: string;

}
// 员工接口继承了 Person 接口
interface Employee extends Person {
  job:string
}
// type 也可以继承 类型别名
type PersonType = {name:string}
type EmployeeType = PersonType & {job:string}
const e1:Employee = {name:'陈俊璋',job:'字节agent开发工程师'}
