# ajax
异步javascript和xml
异步请求
异步响应

## JSON.stringify()
- 语法：JSON.stringify(obj, replace, space)
- 将对象序列化为json 格式字符串,便于网络传输
- replace 是否要做取舍 null 原样序列化
- space 给几个空格 团队规范 可读性

## JSON.parse()
将json字符串转换为js对象

## JS异步处理
- js是单线程，遇到异步任务，放到event loop 中，跳过往下执行
- 等到执行时机到了，再从eventloop中拿出回调函数执行。callback
- 也可以使用Promise（封装异步任务） + then()
- 最建议的 async / await
    比上面的都优秀
    跟同步看过去一样