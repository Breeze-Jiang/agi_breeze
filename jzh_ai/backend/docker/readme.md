# Docker
容器
海运 万吨巨轮
Docker 应用容器化工具，解决我的电脑能跑，
- next
- redis
- react
- mysql
除了代码，依托一堆的，有版本要求的 运行环境，docker 帮我们打包为一个整体的容器，非常方便的部署在任何设备上


Docker = 应用 + 运行环境

## 举例
你到公司接受一个n年前的Vue2的项目，要求使用Node16 + npm 8
你的电脑转的是node22 ， 跑不起来
容器化的 docker 虚拟化技术， 将各个依赖隔离化安装

## Docker 基本概念
应用程序 + 环境 隔离的
git pull image
container DVD

## Web 简单应用
http://localhost:1314
:80  默认端口号
运维知识
服务器软件 把所有80端口产生的请求， 代理给3000端口


## nginx 服务器
高并发，代理转发，需要nginx服务器
监听80端口的访问
并通过配置文件帮我们转发给3000端口

### 启动 nginx image
docker run 
  启动一个镜像，成为可运行容器
  --name my-nginxndemo
  容器的名字
  -p 80:80
  映射端口，本机80端口映射到容器的80端口
  将用户浏览器的输入， 代理给容器的80端口
  -v  C:\Users\38335\Desktop\workspace\jzh_ai\backend\docker\demo\nginx.conf:/etc/nginx/nginx.conf
  nginx.conf 配置文件(本机)
  80 代理3000端口
  -d nginx
  后动nginx 服务器



  docker run --name my-nginxndemo -p 80:80 -v  C:\Users\38335\Desktop\workspace\jzh_ai\backend\docker\demo\nginx.conf:/etc/nginx/nginx.conf -d nginx

## 运维考点
- nginx
  方向代理

  nginx:80（nginx.conf代理端口服务） <- 3000 （反向代理）
  localhost 我们是不知道后端具体在哪个端口运行的
