# btn 页面
## 先写结构
- 优秀的套路
## 再写样式
## html5语义化标签
## BEM 国际命名规范
- .page 页面
    开启一个区块 block 
- 分上下两部分
    .page_hd 头部
    .page_bd 主体
    hd，bd 是block的子元素 element
    Block 和Element 之间用_分隔

- Modifier 修饰符
    不同状态
- .weui-btn weui 这个css框架中按钮组件
    weui 项目的标志
    - 主要的，禁用的，
## BEM 的优势
- 国际规范，大家都遵守
- 结构清晰，搭建盒模型方便
    - 有一个区块要表达 block
    - 有几个元素要表达 elements
- 简单易读
- 解决了写页面命名难的问题
    最简单的英文单词 结构相关
    .page
        .page_hd
        .page_title
    没有BEM命名规范，就要多写很多单词\

## CSS 规则
- css rest 重置样式
有些元素默认样式不同，需要重置
把页面变成一张干净的白纸

## AI prompt
- 语义化标签
- BEM 命名规范
- css rest 重置样式
    normalize.css
    不用*通配符，列出要匹配的所有元素

## 微信界面细节
- ui 设计师设计出来
    标注大小
    font-size 17px
    button 高度 24px
    line-height 24/17 = 取8位小数 
