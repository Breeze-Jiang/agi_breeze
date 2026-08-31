# Next.js Blog
## 技术背景
- npx
是npm自带工具，可以直接运行 node 包，无需全局安装依赖。
尝试试用，测试电脑跑项目
npx = npm i -g create-next-app + create-next-app
便捷
- create-next-app
React 全栈开发脚手架
SSR（服务端渲染） SEO（搜索引擎优化） RSC（React Server Components 服务端组件，服务端渲染）
use client; // hydration 水合 

## 项目需求
笔记系统，crud 笔记，支持markdown 格式
存在数据库里的是markdown ， 页面显示的是html marked 库

1.界面分为两列  左侧为笔记列表， 右侧为笔记内容
首页 / page.js
2.点击new 按钮， 增加一个note， 增加后，左侧笔记列表也会同时更新
App Router 文件即路由 restful 
/ note /id
 [id] 动态路由
 page.js note详情
 / edit
3.编辑功能， 可以删除一个笔记， 左侧同时更新
4.可以编辑当前note，支持markdown 格式
5.搜索功能

## 技术分析
### 路由
### 组件
规范驱动编程
提前规划需要那些组件
  组件是工作单元， ai生成的工作单元
  开发之前不需要急着写代码
  分析需求， 技术方案（next.js） 任务细节 路由+组件
  Siderbar
    SidebarSerachField EditButton（复用）
    SiderBarNoteList
      NoteItem
  Note
    NoteEdit 负责笔记的编辑
    NotePreview 负责笔记的预览

### 目录结构
- app
  页面主目录
  page.js
  layout.js
  [id]
- components 组件
- lib 
  数据库操作
  常用的函数
- public

### 配置alias
/app/notes/[id]/page.js
引入 lib /redis.js
相对路径 ../../../lib/redis.js
短链接 工程化手段 @lib/redis.js alias

path 
  @ 直接来到根目录

### BEM 命名规范
- 原子类

- BEM 维护
  Block 块
  Element 元素
  Modifier 修改器
- layout
  - html
    head
      title
      meta
    body
      page.js
  - nav 侧边栏， 导航栏
  - section 语义化标签
  - children page.js
  - to be continue 注释大法
  规划未来，有利于团队协作，记忆，维护，注释写好要做的事情


## 数据服务
- 选择了redis  key:value 的NOSQL 内存数据库
  6379 端口 没有数据表，不是关系型的， 不用sql 驱动， 在内存中
  有点像localStorage 直接key:value 存储
  高级的地方是 对不同类型的数据 有优化的存储方 不同的方法
  字符串 直接get/set ， 列表 可以用lpush/lpop 等方法 ， 哈希 可以用hset/hget 等方法
  缓存， 计数器
  当项目较大时 会用redis + MySQL 数据库
  因为数据库有读写的I/O瓶颈
  掘金首页，文章列表， 可能在几分钟之内， 不变的
  当第一个用户来的时候 查mysql 数据库 post 列表  key:value 存到redis中
  下一个用户来 ， 从redis 中读取
- lib 目录下有 redis.js 文件
  在next.js 中 数据业务逻辑都放在lib 目录下
- /app/api/route.js?
  接口的rpc 远程调用


核心思想 ：父组件 RSC 取数据 + 渲染 HTML 给搜索引擎看；子组件客户端组件处理用户交互。 最小化客户端组件范围 。



# 检查是否在跑
redis-cli ping

# 进 Redis 命令行
redis-cli

# 查看所有 key
redis-cli keys *

# 停止 Redis（需要时）
redis-cli shutdown