## Git 
- Head 指针
指向当前所在的分支，所在的版本
git rest --hard 
         --soft 
回退到历史的任意版本

--hard 丢弃目前的修改，直奔上一个版本，仓库是干净的 重新写prompt
--soft 不会丢弃工作区的修改， 会去到那个版本进入暂存区之前  生成的局部修改
git restore --stage 文件名  将暂存区的代码移除，工作区
git checkout -- 文件名  将工作区的代码移除，暂存区和仓库的代码保持一致