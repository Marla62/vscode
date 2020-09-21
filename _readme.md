1. 下载源代码
	fork到自己的仓库
	git clone 自己的仓库地址

2. 有时您会希望用fork合并上游存储库中的更改（官方代码存储库）。
	这点暂时存疑，不会用
	cd vscode
	git checkout master
	git pull https://github.com/microsoft/vscode.git master
	管理任何合并冲突，提交它们，然后将它们推入您的叉子。

3. 在本地尝试编译
	1. yran install
	 - 报错 vscode-ripgrep 安装失败 是因为没有翻墙

		解决办法：修改hosts文件新增对git*的访问

		https://blog.csdn.net/u012782078/article/details/106109620?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.channel_param&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromMachineLearnPai2-1.channel_param

		https://www.jb51.net/os/MAC/186514.html
	2. yarn watch开始构建vscode
