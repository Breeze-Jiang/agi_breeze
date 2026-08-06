# 浏览历史
## 路由 Route
- navigator 对象
- 浏览器 url
  - url 浏览器 访问代理
  - http 协议 server 发起请求
  - server 伺服状态 给与响应 text /html
  - 浏览器拿到响应数据 渲染页面
  - 浏览器历史插入一条记录
## 链接
万物互联 链接
<a href="https://www.baidu.com">跳转</a>


传统的，每次都要重新渲染整个页面 pc时代
慢， 没必要重新渲染整个页面
移动时代 ， app 体验是不一样的
单页应用 Single Page Application
SPA
传统的多页面 每次都需要重新渲染 移动端时代没必要 网速慢的时候页面会变白

怎么把丰富的内容在一个网页里显示
DOM 编程
根据相应的url
/ index.html content DOM 放到 #container
/ about about.html content DOM 放到 #container



## 单页应用
- 点击链接跳转
  - url 和资源一一对应关系
  怎么改变url
  hash 方式可以做到
  改变hash ， url 改变了 ， 不会跳转

## Hash 路由
https://www.baidu.com/u/123?a=1&b=2#page1
protocol://host/path/queryString#hash
url 中， hash 部分 # 开始
- url 一定要变，不同url对应不用的资源
- 监听变化 根据hash 部分 渲染不同的内容
优点是url 改变了（局部）

锚点链接
hash 作为url 的一部分,标记一个传统的pc长页面的某一部分,坐电梯一样直达
做前端路由 #/ #/about 不会重新渲染 , 又能满足url 和 资源的一一对应关系, 前端路由
当hash 部分改变的时候, hashchange 事件 ,dom 或组件替换