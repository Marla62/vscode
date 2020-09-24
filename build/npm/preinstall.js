/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

let err = false;

const majorNodeVersion = parseInt(/^(\d+)\./.exec(process.versions.node)[1]);

// 如果node的版本大于13或者小于10 退出代码执行 err掷为true
if (majorNodeVersion < 10 || majorNodeVersion >= 13) {
	console.error('\033[1;31m*** Please use node >=10 and <=12.\033[0;0m');
	err = true;
}

// 子进程
const cp = require('child_process');
// 执行命令 查询yarn版本 主版本号/次版本号/修订号
const yarnVersion = cp.execSync('yarn -v', { encoding: 'utf8' }).trim();
// 对输出内容进行格式化
const parsedYarnVersion = /^(\d+)\.(\d+)\.(\d+)/.exec(yarnVersion);
// 主版本号
const majorYarnVersion = parseInt(parsedYarnVersion[1]);
// 次版本号
const minorYarnVersion = parseInt(parsedYarnVersion[2]);
// 修订号
const patchYarnVersion = parseInt(parsedYarnVersion[3]);

// 限制yarn的版本
if (majorYarnVersion < 1 || minorYarnVersion < 10) {
	console.error('\033[1;31m*** Please use yarn >=1.10.1.\033[0;0m');
	err = true;
}

// 限制使用yarn安装依赖
if (!/yarn[\w-.]*\.js$|yarnpkg$/.test(process.env['npm_execpath'])) {
	console.error('\033[1;31m*** Please use yarn to install dependencies.\033[0;0m');
	err = true;
}

// 如果存在错误 那么终止线程
if (err) {
	console.error('');
	process.exit(1);
}
