# Git

- 开发的目录
  - 多人协作，如何分布式存储
  github
  gitee 码云
  gitlab 
  中央仓库，多人多地共享协作

- 操作的冲突
  文件的版本
  一个文件，多个版本
  文件系统  ->  版本控制系统
  回溯项目工程，更安全，好评估


## learn_git
创建了一个新的learn_git文件夹
目前是空的项目文件夹
  代码文件（硬盘坏了，改了忘了，多人协作）
  本地文件 分布式，版本管理
让git 接管它，成为代码仓库
  - GitHub 中央仓库
  - git init 本地仓库（文件 -> 版本（快照））
    在命令行中执行
    - 1.输入git init 命令初始化本地仓库
    项目 -> 仓库 转变 
    .git 仓库隐藏目录 安全，不能随便操作 按git的约束来执行
    git bash 微型的 linux bash 环境
    shell 脚本
    - 2.输入ls -al 查看隐藏文件

    文件 文件版本（快照）
    - 3.输入git status 查看仓库状态
    常用，做任何git 操作前，
    明确仓库当前状态

    - 4.git add 添加文件到暂存区
    readme.md 文件 untracked
    将一个未被仓库跟踪的文件，添加到暂存区
    to be committed 等待提交
    - 5.git commit -m 'wrote a readme.md'
    存储到了.git  仓库中，有了第一个快照
    2 insertions 新增了2行内容

