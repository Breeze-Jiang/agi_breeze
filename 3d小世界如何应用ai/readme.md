# 3d 小世界

下一代大模型，物理大模型，不再满足与aigc（生成文本/图片/视频）
通向agi世界，工业4.0，具身智能，虚拟化
前端3d 技术

## opc 流程
### pm

了解用户需求，定义产品功能，设计产品界面，与开发团队合作，确保产品符合用户需求。

### 设计师

根据pm的需求，设定风格

### 工程师

确定技术构架

## be ai native

以ai为核心思想，工具，生产力，用ai重构工作和解决问题

## prompt engineer
例题：创建一个3d 小世界的prompt

我想做一个网页的“3d小世界编辑器”，定位是“摆在桌子上的小模型”的那种感觉

1.我想要的体验

- 打开网页就看到一个8*8左右的3d小世界，立刻能玩
- 鼠标点格子放东西（草地，土地，水，石头，树，房子，擦除，7个工具）
- 拖拽转视角，滚轮缩放
- 鼠标悬停的格子要收视觉反馈
- 关闭网页，下次打开还在
- 能切换 3 个不同的存档世界
- 一个“重置”按钮给我一个程序化生成的随机小村庄（有水塘，石堆，几栋房子，几颗树木，小路）
- 一个“清空”按钮，清空当前世界

2.技术约束

- 单页面，零构建：直接双击 html 就能js
- 文件不超过3个：一个html，一个css，一个js
- Three.js 作为3d 渲戏引擎，用CDN引入（r128版本），不要ES module，不要import map，npm
- 不要 React / Vue / Typescript / Webpack / Vite / OrbitControls 等框架
- 所以3d物体用Three.js 内置几何体（如 BoxGeometry, SphereGeometry, CylinderGeometry, ConeGeometry, TorusGeometry, RingGeometry, TextGeometry, TextBufferGeometry, TextGeometryBufferGeometry, TextGeometryBufferGeometryBufferGeometry）不要外部模型或贴图

3.视觉效果

- 积木玩具风格，颜色饱和，对比明确
- 背景是奶油或米色（CSS 处理，不是 Three.js 的天空），不要做天空，不要地平面，光照要“日落”感而不是“演播室白炽灯” —— 草地不要被照成发白

4.ui 风格

- 顶部一个标题面板 + 一个存档面板 （下拉选 + 重置 + 清空按钮）
- 底部居中浮一个工具卡片栏，每个工具卡片有emoji 图标 + 中文标签
- 右下小地图（ canvas 2d），俯视显示当前世界，地形用色块，树和房子剪影
- 全部面板用浅色磨砂玻璃风格（半透明 + 模糊背景） ，圆角

5.代码组织

- HTML 只放结构和引用
- CSS 写所有外观
- JS 包成IIFE，逻辑分段（场景/光照/数据/工厂/交互/持久化/小地图/启动），用注释分隔
- 数据用"world[x][z] = { terrain, kind }"，所有写入走唯一入口（比如setCell）


markdown 文档格式

## 副标题

复杂的prompt 逻辑分割 llm 更清晰
业务场景 ai + 业务
程序员的核心竞争力，代码向后，业务向前
领域知识 前端3d游戏 Three.js 

## AIGC

LLM chatbot 生成代码并复制
vscode 代码编辑器
cursor 不再是简单的编辑器 AI Coding Agent （思考，手脚，创建文件）

## LLM  

Large Language Model
大模型是依托海量数据训练
AI 数据标注/训练数据
参数量庞大的深度神经网络模型（DNN Deep Neural Network）
具备强语义理解能力（自然语言编程NLP Natural Language Processing）
逻辑推理和内容生成能力，可适配多类复杂智能任务

简单理解：大模型是一个超级智能的助手，它可以理解用户的问题，生成符合要求的内容。

y = fθ(x)
x 是prompt输入
f 是复杂与训练函数
θ 全部模型参数（权重）
y 是神经网络运算得到的结果