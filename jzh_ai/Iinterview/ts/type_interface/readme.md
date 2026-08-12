# TS 必考题之 type & interface 的区别
- interface 的开发用法
- 共同点
  interface 和type 都可以描述**对象**的结构，
  用于函数参数，返回值类型
  给对象，变量做类型约束

## 区别
- 继承
  interface 用的是extends 关键字， 
  type 用的是& 关键字
- 声明的合并
  interface 属性可以分头多次定义，合并
  type 不可以重复声明
- 能否表述非对象类型 
  简单数据类型别名 只能用type 表达
  interface 只能表述对象类型
  type 可以表述非对象类型
- 函数类型的区别
  都可以表达， 有些区别， type更方便
