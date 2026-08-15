# cover-handdrawn 提示词

## 填充后的英文提示词

```text
Use case: illustration-story
Asset type: 16:9 technical article cover, 1600x900
Primary request: a warm hand-drawn colored pencil and ink illustration on cream textured notebook paper showing ESLint code quality engineering. On the left a configuration document with five labeled slots representing config fields, arrows flowing rightward to a code file being scanned, with three small severity icons: a red stop sign for error, a yellow caution triangle for warn, and a grey crossed circle for off. A small wrench symbol fixing quotation marks and semicolons but shrugging at an unused variable, communicating the boundary of auto-fix. Warm cream paper, charcoal linework, soft lavender, sky blue and coral watercolor accents.
Style/medium: colored-pencil shading, fine black liner pen, lightly imperfect notebook doodle, subtle watercolor washes on warm cream textured paper.
Composition/framing: wide landscape composition; keep the main objects in the central 80% safe area.
Lighting/mood: warm, human, curious, approachable, easy to understand.
Color palette: cream paper, charcoal linework, soft lavender, sky blue and coral accents.
Constraints: no title text, no readable words, no letters, no Chinese characters, no logos, no brand marks, no watermark, no invented metrics or UI details.
```

## 尺寸
1600x900（landscape_16_9）

## 主题来源
文章核心判断：ESLint 用 flat config 把团队代码风格一致性和潜在 bug 检测工程化；规则严重级别 0/1/2 决定阻断/警告/放行；--fix 只能修格式类，逻辑类必须人工。

## 生成状态：失败（降级为提示词）
调用 `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=...&image_size=landscape_16_9` 两次，分别使用手绘风和等距 3D 风两套差异明显的英文 prompt，但 API 两次返回字节完全相同的 JPEG（大小 176626 bytes，md5=19a0b822edb1），无法生成两种区分风格的封面。

失败原因：图片生成 API 对不同 prompt 返回相同的固定图片（与上一任务 Next.js 封面生成结果完全一致，md5 相同），疑似 API 占位响应或缓存异常，无法满足「两种风格封面」的产物要求。

按 Skill 规则降级：保留本提示词文件，不在文章 Markdown 中写入图片链接。
