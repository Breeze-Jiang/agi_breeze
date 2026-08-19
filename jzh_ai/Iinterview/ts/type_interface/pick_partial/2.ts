interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

type Userkeys = keyof User; // "id" | "name" | "age" | "email"  
// keyof 是 TypeScript 的 类型操作符 ，作用是：
//  获取一个对象类型的所有属性名，并组成联合类型。

type KeepKeys = Exclude<Userkeys, "email">; // "id" | "name" | "age"
// 从一个 联合类型 中排除指定成员，得到新的联合类型。

type userOmit = Omit<User, KeepKeys>; // { id: number; name: string; age: number; }