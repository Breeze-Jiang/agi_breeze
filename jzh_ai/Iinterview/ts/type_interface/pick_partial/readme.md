# Docker
- 本地安装了 mysql
- docker pull mysql
  版本不一样



  docker exec -it mysql-demo/bin/bash
  进入容器 Linux 终端
  mysql -u root -p
  进入 mysql 数据库



## TS 的高级类型 工具类型
- Pick<T, K>
  Pick 是 TypeScript 内置的 工具类型 ，作用是：
  从一个已有类型中(T)挑选指定属性(K)，并组成一个新类型。
- Omit<T, K>
  Omit 是 TypeScript 内置的 工具类型 ，作用与 Pick 相反：
  从已有类型中(T)排除指定属性(K)，并剩余属性组成新类型。
- Partial<T>
  Partial 是 TypeScript 内置的 工具类型 ，作用是：
  把一个类型(T)的所有属性都变成可选属性。
  结果等价于：
  type PartialUser = {
  id?: number;
  name?: string;
  age?: number;
  email?: string;
  };
  其中 ? 表示该属性可以不提供。
- Required<T>
  Required 是 TypeScript 内置的 工具类型 ，作用是：
  把一个类型(T)的所有属性都变成必填属性。
- Record<K, T>
  Record 是 TypeScript 内置的 工具类型 ，作用是：
  根据指定的“键类型”(K)和“值类型”(T)创建一个对象类型。
  例如：
  type Scores = Record<string, number>;
  表示：
  对象的键：string
  对象的值：number
  等价于：
  type Scores = {
  [key: string]: number;
  };
  使用：
  const scores: Scores = {
  张三: 90,
  李四: 85,
};

- ReturnType<T>
  ReturnType 是 TypeScript 内置的 工具类型 ，作用是：
  获取一个函数类型的返回值类型。
  function fn(){ return {x:1,y:2} }
  type FnReturn = ReturnType<typeof fn>;

- Exclude<T, U>
  Exclude 是 TypeScript 内置工具类型，作用是：
  从一个 联合类型(T) 中排除指定成员(U)，得到新的联合类型。


## pdd 原题
Omit <T, K> 等价于 Pick <T, Exclude < keyof T, K> > 怎么理解
- keyof T 获取类型 T 的所有属性名，并组成联合类型。
- Exclude < keyof T, K> 从类型 keyof T 中排除指定成员 K，得到新的联合类型。
- Pick <T, Exclude < keyof T, K> > 从类型 T 中挑选属性挑选剩下的属性，组成新类型。就实现了 Omit <T, K> 的功能。
- TS內部 Omit 的等价思想
