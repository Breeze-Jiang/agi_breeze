# shadcn/ui 按钮替换设计

## 目标

正式初始化 shadcn/ui，并使用其 `Button` 组件替换当前项目中所有具有按钮视觉和操作语义的链接，同时保持导航、普通文本链接和 Blog 卡片链接不变。

## 技术方案

- 使用 shadcn CLI 为现有 Next.js、TypeScript、Tailwind CSS 4 项目生成配置。
- 添加官方 `Button` 组件及其必要依赖和工具函数。
- 链接按钮统一采用 `Button asChild`，由已有 `Link` 或 `a` 作为实际 DOM 元素，避免无效的交互元素嵌套。
- 主操作使用 `default` variant，次操作使用 `outline` variant。
- 通过 `size` 和少量页面级 `className` 保持现有高度、圆角、宽度和响应式布局，不改变页面结构与跳转目标。

## 替换范围

### 首页

- `Deploy Now`：外部链接，主按钮。
- `Documentation`：外部链接，次按钮。

### About 页面

- `返回首页`：站内链接，次按钮。
- `阅读官方文档`：外部链接，主按钮。

### 404 页面

- `返回首页`：站内链接，主按钮。
- `了解 Next.js`：站内链接，次按钮。

### Blog 详情页

- `返回 Blog`：站内链接，次按钮。
- `阅读 CSDN 原文`：外部链接，主按钮。

## 不替换范围

- 根布局中的 `NEXT.JS`、`About` 和 `Blog` 导航链接。
- 首页正文中的 Templates 和 Learning 普通文本链接。
- Blog 列表中的整卡链接与“阅读全文”提示。
- 分类标签、卡片和其他非交互视觉元素。

## 组件与样式

- Button 组件存放于 `components/ui/button.tsx`。
- shadcn 工具函数按 CLI 默认约定存放于 `lib/utils.ts`。
- 使用项目别名导入组件，不复制按钮样式到各页面。
- 保留外部链接的 `target="_blank"` 与 `rel="noopener noreferrer"`。
- shadcn 主题变量纳入现有全局样式，并兼容当前浅色和深色主题。

## 错误处理与兼容性

- 初始化前遵循项目中 Next.js 16.3.1 的本地文档与现有配置。
- 不把页面转换为 Client Component；所有页面继续作为 Server Component 渲染。
- 若 CLI 对已有全局样式提出覆盖，选择合并而不是丢弃现有样式。

## 验收标准

- 项目存在有效的 shadcn 配置和官方 Button 组件。
- 上述八个按钮式链接全部通过 `Button asChild` 渲染。
- 普通文本、导航和卡片链接未被误替换。
- 所有链接目的地、外部链接安全属性和图标内容保持不变。
- 浅色、深色、移动端和桌面端按钮视觉正常。
- Next.js 生产构建、TypeScript 与编辑器诊断通过。
