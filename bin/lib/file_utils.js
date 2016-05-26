var fs = require('fs');
var atomFs = require('fs-plus');
var path = require('path');
var glob = require('minimatch');

module.exports = {

	/**
	 * 递归获得文件名,并可以加入glob的忽略数组筛选
	 * @param  {string} rootPath 根目录(可以是相对路径)
	 * @param  {string|undefine} basePath 基准(用于相对化路径)路径
	 * @param  {string[]|undefined} ignores glob忽略数组
	 * @return {string[]}
	 */
	'listTreeRelative': function(rootPath, basePath, ignores) {
		if (!basePath) basePath = rootPath;
		if (!ignores) ignores = [];
		//获得绝对路径
		rootPath = path.resolve(rootPath);
		var r = atomFs.listTreeSync(rootPath);
		var result = [];
		var tmp = '';
		for (var i in r) {
			//去除路径
			if (atomFs.isDirectorySync(r[i]))
				continue;
			//相对化路径
			tmp = path.relative(basePath, r[i]);
			for (var j in ignores) {
				//在忽略列表内
				if (glob(tmp, ignores[j])) {
					tmp = void 0;
					break;
				}
			}
			//如果没有被忽略
			if (tmp !== void 0)
				result.push(tmp);
		}
		return result;
	},
	/**
	 * @param {string} basePath
	 * @param  {string[]} files
	 * @param  {object} baseInfo
	 * @return {object}
	 */
	'genFilesInfo': function (basePath, files, baseInfo) {
		if (!baseInfo) baseInfo = {};
		for (var i in files) {
			var fname = files[i];
			var abspath = path.join(basePath, fname);
			var stat = fs.statSync(abspath);
			baseInfo[fname.replace(/\\/g, '/')] = [
				atomFs.md5ForPath(abspath),
				stat.mtime.getTime(),
				stat.size
			];
		}
		return baseInfo;
	}
};