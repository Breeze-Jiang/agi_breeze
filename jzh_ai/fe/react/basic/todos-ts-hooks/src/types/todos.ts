// interface 声明不了简单数据类型
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
// 类型别名 简单数据类型
// 联合类型
export type FilterType = 'all' | 'completed' | 'uncompleted'