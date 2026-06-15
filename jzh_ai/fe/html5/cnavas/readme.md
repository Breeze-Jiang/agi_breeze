# AI 游戏

- 页游
4399 flash 游戏
html5 2d / 3d 游戏

## HTML5 炫酷功能
Canvas 2d/3d 数据可视化/网页游戏/炫酷画面
- canvas 标签
画布  js api 想怎么画就怎么画
太老旧的浏览器不支持
- canvas api 
  - canvas 有大量的js 绘制api 
  - 首先获取canvas 标签 
  - getContext('2d/3d') 上下文
    ai 游戏爆发 three.js 
    物理大模型
  - 绘制各种图形
    rect 绘制矩形
    circle 绘制圆
    line 绘制线
  - 擦除
    clearRect(x, y, width, height) 清除矩形区域
    左上角 + 宽/高
  - 颜色
    fillStyle 填充颜色
    strokeStyle 边框颜色

- 怎么做游戏?
    按帧动画
    - clear 擦掉之前的
    - 绘制新的
    - 显卡帧 1s/60 次

## requestAnimationFrame
浏览器提供的适配屏幕刷帧率的高效动画帧调度函数
- 不能用setTimeout
  时间可能和显示设备的刷帧率不在一个频道上
  而requestAnimationFrame 是和显示设备的刷帧率一致的 所以可以实现更流畅的动画
- 参数 递归的方式 绘制函数
- clear 方法
  帧动画不停的画，就有了动画
  加上交互，游戏

## 飞机游戏
- 工程初始化
  vite，git 
  帮我们安装必要的依赖
  .env
- 可以和cc 头脑风暴
  - 产品方面：游戏功能列表，选择其中的一些，做第一个阶段的开发
  MVP 最小可行性方案
  技术路线什么样的
  技术方案
- llm 生成 

## 数据可视化
echart 报表
