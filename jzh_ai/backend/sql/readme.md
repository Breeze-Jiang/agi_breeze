# SQL

## 后端业务有几张表？
文章、点赞，收藏、评论、用户、头像
- 怎么建表
- 怎么建索引
- 怎么建约束

## 用户表 
- 用户规模  性能 
  用户得登录，用户表最好只存储id, username, password 核心字段
  user表比较小， 有利于分布式，有利于快速查询，有时候还要分表。
  id 自增 Primary Key 
  username Unique Key 不能重复
  password 不能存明文
  头像、slogan 可以另外建表关联查询

索引？ Index, 多少类索引， 为啥建？ 
查询需求 高频查询 安排索引
-  小家  /user/:id   id Primary Key
- 搜索用户 unique Key 
```
CREATE TABLE `user`(
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4_unicode_ci
```
## 头像表
头像图片服务器放在静态服务器上。
/public/avatar/:id 
云服务器， OSS 独立的静态资源服务器 存放， 放回就是一个阿里云的地址。

```
CREATE TABLE `avatar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mimetype` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  <!-- 普通索引  根据用户id 查询头像 -->
  KEY `userId` (`userId`),
  CONSTRAINT `avatar_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
)ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4_unicode_ci
```
https://p6-passport.byteacctimg.com/img/user-avatar/11174122cb6102aca29ac7599f4e08b4~40x40.awebp

nest.js， 数据库 后端业务 部署在中央机房 强关联的 juejin.cn 
由nginx 反向代理的一批服务器集群中

juejin.cn 域名 
**dns 解析**  分布式数据库 逐级递归查找 
先看本地有没有缓存 （浏览器，本地也有）
局域网  校园网 dns 服务器 
网络服务商  一些dns 服务器 账本 双11
国家服务器 
根服务器 .com .org  米国

 ip 地址 三次握手，建立连接 

根据我们的所在， 将最近的服务器ip地址给我们（nginx 服务器地址， 并不是真正服务的服务器地址）
好几个服务区， 每个服务区配置*nginx 负载均衡服务器* 的ip地址
nginx不做具体的代码， 只做负载均衡， 挑选出集群中健康的服务器， 代理之。
服务器集群， 独立IP, 都有web 程序， 都能提供服务 由一台负载均衡服务器nginx 来
反向代理。 

**静态服务器**， img, css, js 静态资源， 简单， 有自己的特征

cdn 服务器 content dilivery network 专门用于发布静态资源
网络公司， 很多的网络节点购买一些cdn 服务器， 用户就近访问资源。

## 文章表
```
CREATE TABLE `post` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext  COLLATE utf8mb4_unicode_ci,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY(`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `post_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4_unicode_ci
```
## 点赞表

## 收藏表
## 评论表