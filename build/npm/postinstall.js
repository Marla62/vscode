/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const cp = require('child_process');
const path = require('path');
const fs = require('fs');
const yarn = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';

/**
 * @param {string} location
 * @param {*} [opts]
 */
function yarnInstall(location, opts) {
	opts = opts || { env: process.env };
	// 子进程的当前工作目录 指向目标文件目录
	opts.cwd = location;
	// 子进程的 stdio 配置
	opts.stdio = 'inherit';
	// raw: {"remain":[],"cooked":["run","postinstall"],"original":["run","postinstall"]}
	const raw = process.env['npm_config_argv'] || '{}';
	const argv = JSON.parse(raw);
	// "original":["run","postinstall"]
	const original = argv.original || [];
	// 需要执行的指令list
	const args = original.filter(arg => arg === '--ignore-optional' || arg === '--frozen-lockfile');

	console.log(`Installing dependencies in ${location}...`);
	console.log(`$ yarn ${args.join(' ')}`);
	// 在opts.cwd目录下执行命令
	const result = cp.spawnSync(yarn, args, opts);

	if (result.error || result.status !== 0) {
		process.exit(1);
	}
}
// 依赖注入，在extensions目录下执行yarn命令: 安装指定的依赖项
yarnInstall('extensions'); // node modules shared by all extensions
// !(32位的win系统 && (处理器架构是 arm64 ||  process.env['npm_config_arch'] === 'arm64'))
if (!(process.platform === 'win32' && (process.arch === 'arm64' || process.env['npm_config_arch'] === 'arm64'))) {
	yarnInstall('remote'); // node modules used by vscode server
	yarnInstall('remote/web'); // node modules used by vscode web
}

// 同步读取extensions文件夹下的所有文件
const allExtensionFolders = fs.readdirSync('extensions');
// extensions输出: ['bat', 'clojure']
const extensions = allExtensionFolders.filter(e => {
	try {
		// path.join('/目录1', '目录2', '目录3/目录4', '目录5', '..');
		// 返回: '/目录1/目录2/目录3/目录4'
		// 返回: extensions/bat/package.json
		let packageJSON = JSON.parse(fs.readFileSync(path.join('extensions', e, 'package.json')).toString());
		// 如果package.json存在 && ( dependencies字段指定了项目运行所依赖的模块 || devDependencies指定项目开发所需要的模块 )
		return packageJSON && (packageJSON.dependencies || packageJSON.devDependencies);
	} catch (e) {
		return false;
	}
});
// 在`extensions/${extension}`目录下安装依赖： 执行 yarn命令
extensions.forEach(extension => yarnInstall(`extensions/${extension}`));

/**
 * 安装构建依赖项
 */
function yarnInstallBuildDependencies() {
	// 确保我们的系统安装了watch
	// make sure we install the deps of build/lib/watch for the system installed
	// node, since that is the driver of gulp
	const watchPath = path.join(path.dirname(__dirname), 'lib', 'watch');
	const yarnrcPath = path.join(watchPath, '.yarnrc');

	const disturl = 'https://nodejs.org/download/release';
	const target = process.versions.node;
	const runtime = 'node';

	const yarnrc = `disturl "${disturl}"
target "${target}"
runtime "${runtime}"`;
	// TODO？应该是将错误日志记录到了yarnrc中
	fs.writeFileSync(yarnrcPath, yarnrc, 'utf8');
	yarnInstall(watchPath);
}

yarnInstall(`build`); // node modules required for build
yarnInstall('test/automation'); // node modules required for smoketest
yarnInstall('test/smoke'); // node modules required for smoketest
yarnInstall('test/integration/browser'); // node modules required for integration
yarnInstallBuildDependencies(); // node modules for watching, specific to host node version, not electron

cp.execSync('git config pull.rebase true');
