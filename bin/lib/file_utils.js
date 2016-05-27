var fs = require('fs');
var atomFs = require('fs-plus');
var path = require('path');
var glob = require('minimatch');

var thiz = {

	/**
	 * 递归获得文件名,并可以加入glob的忽略数组筛选
	 * @param  {string} rootPath 根目录(可以是相对路径)
	 * @param  {string} basePath 基准(用于相对化路径)路径
	 * @param  {string[]} ignores glob忽略数组
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
	 * 获得给定文件数组内每个文件的信息(md5, mtime, size)
	 * @param {string} basePath
	 * @param  {string[]} files
	 * @param  {object} baseInfo
	 * @return {object}
	 */
	'genFilesInfo': function(basePath, files, baseInfo) {
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
	},

	/**
	 * 更新部分文件信息
	 * @param  {object} updateInfos 需要更新的部分文件信息对象
	 * @param  {object} oldInfos 原始文件信息对象
	 * @return {object} 新的文件信息对象
	 */
	'updateFilesInfo': function(updateInfos, oldInfos) {
		var newInfos = JSON.parse(JSON.stringify(oldInfos));
		for (var i in updateInfos) {
			newInfos[i] = updateInfos[i];
		}
		return newInfos;
	},

	/**
	 * 读取文件信息(如果文件信息缓存json存在就从缓存json中读取)
	 * @param  {string} jsonFile
	 * @param  {string} infoFolder
	 * @param  {string[]} ignoreFiles
	 */
	'loadFilesInfo': function(jsonFile, infoFolder, ignoreFiles) {
		try {
			return JSON.parse(fs.readFileSync(jsonFile));
		} catch (ex) {
			return thiz.genFilesInfo(infoFolder,
				thiz.listTreeRelative(infoFolder, infoFolder, ignoreFiles));
		}
	},

	/**
	 * 保存文件信息(使用部分新的信息覆盖旧的信息)
	 * @param  {string} jsonFile
	 * @param  {object} updateInfos
	 * @param  {object} oldInfos
	 * @return {object} newInfos
	 */
	'saveFilesInfo': function (jsonFile, updateInfos, oldInfos) {
		var newInfos = oldInfos ? thiz.updateFilesInfo(updateInfos, oldInfos) : updateInfos;
		try {
			fs.writeFileSync(jsonFile, JSON.stringify(newInfos));
		} catch (ex) {
			console.error(ex);
		}
		return newInfos;
	},

	/**
	 * 比较新的信息与旧的信息的差异
	 * @param  {object} newInfos
	 * @param  {object} oldInfos
	 */
	'diffFilesInfo': function (newInfos, oldInfos) {
		var result = {};
		var oldName = {};
		for (var i in oldInfos)
			oldName[i] = true;
		for (var i in newInfos) {
			if (oldInfos[i]) {
				delete oldName[i];
			} else {
				result[i] = newInfos[i];
				continue;
			}
			if (thiz.compareFileInfo(newInfos[i], oldInfos[i], true) !== true) {
				result[i] = newInfos[i];
				continue;
			}
		}
		for (var i in oldName)
			result[i] = {};
		return result;
	},
	/**
	 * 比较两个文件信息数组是否一样
	 * @param  {any[]} info1
	 * @param  {any[]} info2
	 * @param  {boolean} allowMTime 允许修改时间不同
	 * @returns {number | boolean} true:相同,数字,表示差异位置
	 */
	'compareFileInfo': function(info1, info2, allowMTime) {
		for (var i in info1) {
			if (allowMTime && i == 1) continue;
			if (info1[i] != info2[i])
				return parseInt(i);
		}
		return true;
	}

};
module.exports = thiz;