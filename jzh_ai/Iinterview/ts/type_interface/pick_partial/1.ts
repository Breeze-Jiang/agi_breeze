interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

// 有什么特性 一个类型里挑选一些你需要的字段，形成新的类型？
// 负责项目，区分度
// 大型项目类型消费比较多
type UserPriview = Pick<User, 'id' | 'name'>;
const u:UserPriview = {
  id: 1,
  name: '张三',
}

// omit 去掉部分字段
type UserSafe = Omit<User, 'email'>;
const uSafe:UserSafe = {
  id: 1,
  name: '张三',
  age: 18,
}

// partial 部分属性可选
type PartialUser = Partial<User>;
const uPartial:PartialUser = {
  id: 1,
  name: '张三',
  age: 18,
}

// required 所有属性必填
type RequiredUser = Required<User>;


type RecordUser = Record<string, number>;
type errorUser = Record<number, string>;
const errorUser: errorUser = {
  400: '请求参数错误',
  401: '未登录,请先登录',
  403: '没有权限访问',
   404: '资源找不到',
   500: '服务器错误',
}
// 1xx 成功响应
// 2xx 成功响应
// 3xx 要跳转
// 4xx 用户错误
// 5xx 服务器错误



function getErrMsg(code: number): string {
  return errorUser[code] ?? '未知错误';
}

function fn(){ return {x:1,y:2} }
type FnReturn = ReturnType<typeof fn>;

// 联合类型
type All = "id" | "name" | "age" | "email";
type AfertExclude = Exclude<All, "email">;