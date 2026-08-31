---
type: learning-summary
title: "Docker、Nginx 与 Node.js 反向代理入门"
aliases: ["Docker 反向代理·学习总结"]
tags: [learning, docker, nginx, nodejs]
source_scope: "backend/docker"
coverage: {deep_read: ["readme.md", "demo/index.mjs", "demo/nginx.conf"], shallow_read: ["demo/package.json"], supplement: [], skipped: []}
review_status: learning
next_review: null
---

## 一页速览

- [[#学习范围]]
- [[#知识地图]]
- [[#核心知识]]
- [[#重点语法与 API]]
- [[#注释重点解读]]
- [[#面试高频知识]]
- [[#复习卡片]]
- [[#实践与复习计划]]

> [!summary]
> - Docker 镜像包含应用及其运行所需内容，容器是镜像运行后的实例。
> - `docker run -p 80:80` 把宿主机 80 端口映射到容器 80 端口。
> - Nginx 对外监听 80，再用 `proxy_pass` 把请求转发到宿主机 Node.js 的 3000 端口。
> - 浏览器只知道 Nginx，不知道实际后端，因此这是反向代理。
> - 当前 Node.js 示例混用了 ESM 与 CommonJS，需要保留 `import`、删除 `require`。

## 学习范围

- **深读**：`readme.md`（学习主线）、`demo/nginx.conf`（代理配置）、`demo/index.mjs`（后端入口）。
- **浅读**：`demo/package.json`，只核对模块模式和脚本。
- **补读**：无。
- **跳过**：无其他材料。
- **未知**：没有 Dockerfile、Compose 配置和数据卷示例；未执行项目，运行未验证。

## 知识地图

```mermaid
flowchart LR
  B[浏览器 localhost:80] --> H[Windows 80]
  H -->|端口映射 -p 80:80| N[Nginx 容器 80]
  N -->|proxy_pass| D[host.docker.internal:3000]
  D --> J[Node.js 服务]
```

镜像、容器和配置的关系：

```text
nginx 镜像 --docker run--> Nginx 容器
本机 nginx.conf --绑定挂载--> /etc/nginx/nginx.conf
本机 80 --端口映射--> 容器 80
```

## 核心知识

### 1. 镜像与容器

[材料事实] 笔记把 Docker 的价值概括为“应用 + 运行环境”，重点是隔离依赖并减少环境差异。

- **镜像 Image**：只读模板，可以理解为带运行环境的应用模板。
- **容器 Container**：镜像启动后的运行实例。
- **Docker Hub**：默认公共镜像仓库；拉取镜像应使用 `docker pull`，不是 `git pull`。

### 2. 端口映射

```powershell
docker run --name my-nginx-demo -p 80:80 -d nginx
```

`-p 宿主机端口:容器端口`。这里浏览器访问宿主机 80，Docker 将流量交给容器 80。端口映射只负责“把请求送入容器”，不等于 Nginx 的反向代理。

### 3. 文件挂载

```powershell
-v "C:\path\nginx.conf:/etc/nginx/nginx.conf"
```

左侧是 Windows 文件，右侧是容器路径。Nginx 启动时读取被挂载的配置。Windows 路径建议整体加引号。

### 4. Nginx 反向代理

材料配置的关键链路是：

```nginx
server {
    listen 80;
    location / {
        proxy_pass http://host.docker.internal:3000;
        proxy_set_header Host $host;
    }
}
```

- `listen 80`：Nginx 在容器内监听 80。
- `location /`：匹配所有路径。
- `proxy_pass`：转发给 Windows 宿主机的 3000 端口。
- `host.docker.internal`：Docker Desktop 容器访问宿主机的特殊域名。
- `proxy_set_header Host $host`：把原请求的 Host 传给后端。

### 5. 正向代理与反向代理

- **正向代理**代理客户端：客户端主动找代理访问目标网站，目标服务可能不知道真实客户端。
- **反向代理**代理服务端：客户端访问统一入口，入口再选择后端，客户端通常不知道真实后端。

当前场景：`浏览器 → Nginx → Node.js`，所以是反向代理。

### 6. 当前代码冲突

`index.mjs` 同时出现：

```javascript
import http from 'node:http';
const http = require('http');
```

`.mjs` 强制按 ESM 解释，`require` 不可直接使用，而且变量 `http` 被重复声明。应保留 `import` 并删除 `require`。虽然 `package.json` 写了 `"type": "commonjs"`，但 `.mjs` 的 ESM 规则优先。

另一个边界是服务监听 `localhost:3000`。容器通过宿主机网络访问时，更稳妥的开发配置通常是监听 `0.0.0.0:3000`；具体可达性仍需实际验证。

## 重点语法与 API

| 项目 | 作用 | 常见坑 | 来源 |
|---|---|---|---|
| `docker pull nginx` | 拉取 Nginx 镜像 | `latest` 是标签，不等于绝对最新 | [材料推导] |
| `docker run` | 创建并启动容器 | 同名容器会冲突 | [材料中出现] |
| `--name` | 指定容器名 | 已存在时需删除、改名或启动旧容器 | [材料中出现] |
| `-p 80:80` | 端口映射 | 左宿主机，右容器 | [材料中出现] |
| `-v` | 绑定挂载文件 | Windows 路径建议加引号 | [材料中出现] |
| `-d` | 后台运行 | 返回容器 ID 不代表服务持续健康 | [材料中出现] |
| `docker ps -a` | 查看全部容器 | `docker ps` 只看运行中容器 | [外部补充] |
| `docker logs` | 查看容器日志 | 先根据容器名定位 | [外部补充] |
| `proxy_pass` | 转发请求 | 必须位于允许的上下文，如 `location` | [材料中出现] |

## 注释重点解读

`index.mjs` 中“node 早期的 commonjs 规范”这条注释意在区分 CommonJS 与 ESM，但实现紧接着又同时使用了两套语法，与 `.mjs` 不兼容。正确结论是：CommonJS 使用 `require`，ESM 使用 `import`，当前文件应统一使用 ESM。

## 面试高频知识

1. **[材料中出现] 镜像和容器有什么区别？** 镜像是只读模板，容器是镜像的运行实例。
2. **[材料中出现] `-p 80:80` 两个 80 分别是什么？** 左侧宿主机端口，右侧容器端口。
3. **[材料中出现] 什么是反向代理？** 客户端访问代理入口，代理把请求转给真实后端，并隐藏后端地址。
4. **[材料推导] `docker pull` 和 `docker run` 的区别？** 前者下载镜像，后者基于镜像创建并启动容器。
5. **[外部补充] 为什么容器退出后 `docker ps` 看不到？** 它只展示运行中的容器，应使用 `docker ps -a`。
6. **[材料推导] 端口映射和反向代理是否相同？** 不同：映射连接宿主机与容器端口，反向代理由 Nginx 按配置转发应用层请求。
7. **[材料中出现] ESM 为什么不能直接使用 `require`？** `.mjs` 使用 ESM 模块作用域，其中没有 CommonJS 的全局 `require`。

## 复习卡片

> [!tip]
> 记忆链路：`pull` 下载镜像，`run` 创建容器，`-p` 接通端口，`-v` 注入配置，`proxy_pass` 转发后端。

- Q：镜像运行后叫什么？A：容器。
- Q：`80:3000` 哪个是宿主机端口？A：左侧 80。
- Q：谁隐藏真实后端？A：反向代理。
- Q：Nginx 在哪里接收请求？A：`listen` 指定的端口。
- Q：Nginx 把请求发到哪里？A：`proxy_pass` 指定的地址。
- Q：容器如何访问 Docker Desktop 宿主机？A：可使用 `host.docker.internal`。
- Q：`.mjs` 应使用哪套模块语法？A：ESM 的 `import/export`。

> [!warning]
> 返回容器 ID 只表示 Docker 已创建并尝试启动容器；是否持续运行要看 `docker ps`，失败原因看 `docker logs`。

## 实践与复习计划

- [ ] 当天：修正 `index.mjs` 的模块语法，启动 Node.js，再检查 3000 端口。
- [ ] 当天：启动 Nginx 容器，画出“浏览器→端口映射→Nginx→Node.js”链路。
- [ ] 1 天后：不看笔记解释镜像、容器、端口映射和反向代理。
- [ ] 3 天后：独立写出最小 `nginx.conf`，并用 `docker logs` 排查一次配置错误。
- [ ] 7 天后：尝试用 Docker Compose 管理 Nginx 与 Node.js，并补充容器网络知识。

> [!question]
> 当前材料没有 Dockerfile 与 Compose 文件；Node.js 服务能否被容器稳定访问、Nginx 转发结果均未实际运行验证。
