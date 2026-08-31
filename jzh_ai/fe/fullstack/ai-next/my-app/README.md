1. 文件系统的路由映射
  page.tsx 
  layout.tsx 布局，共享的
  loading.tsx 加载 UI 
  not-found.tsx 404 页面
  error.tsx 错误UI

2. 目录映射 目录名直接映射到URL 路径中

3. Link 组件 
- 它是客户端导航， 无需刷新页面。（前端路由）
Hash ， HistoryRouter 局部刷新
它还是要请求后端的， 只是不整页刷新（白一下）
前端导航时，next.js 会自动发一个RSC payload （React Server Component 序列化）， 数据是服务端（后端）拿的，只是走Ajax 请求， 不是传统浏览器的前端导航


- 预加载可连接的页面，提升速度
<Link ref="prefetch" href="/blog" />
浏览器空闲时就会提前下载目标页的数据，“秒开”效果
资源预加载

性能优化的关键
dns  域名解析成IP 地址
dns domain system 域名解析服务 可以想象成 key-value 存储库
domain -> ip 查询（比如电信服务商），需要解析时间




shadcn-ui 组件库