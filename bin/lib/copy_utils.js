var fs2 = require('fs-extra');
var path = require('path');
var yn = require('yesno_utils.js');

var indexs = { m: 0, t: 1, s: 2 };
var words = {
	m: '文件md5不同,是否需要覆盖',
	t: '文件相比更新,是否需要覆盖',
	s: '文件尺寸不同,是否需要覆盖'
}
var copy =  {
	"shouldCopy": function (fromInfo, toInfo, coverMethod, coverQuest) {
		if (!toInfo)
			return true;
		var index = indexs[coverMethod];
		switch (coverMethod) {
			case 'a': break;
			case 's':case 'm':
				if (fromInfo[index] !== toInfo[index]) break;
				return false;
			case 't':
				if (fromInfo[index] > toInfo[index]) break;
				return false;
			default://n
				return false;	
		}
		return yn(words[index], true);
	},
	
	/**
	 * @param  {any} fromPath
	 * @param  {any} toPath
	 * @param  {any} fromFileInfos
	 * @param  {any} toFileInfos
	 * @param  {string} coverAttr 
	 */
	"copy": function (fromPath, toPath, fromFileInfos, toFileInfos, coverAttr) {
		var coverAttr = coverAttr.toLowerCase();
		var coverMethod = coverAttr[0];
		var coverQuest = !coverAttr[1];
		var modify = {};
		for (var filename in fromFileInfos) {
			if (copy.shouldCopy(fromFileInfos[filename], toFileInfos[filename], coverMethod, coverQuest)) {
				modify[filename] = fromFileInfos[filename];
				fs2.copy(path.join(fromPath, filename), path.join(toPath, filename), function (err) {
					console.error("同步出错!详细信息:");
					console.error(err);
				});
			}	
		}
		return modify;
	}
};

module.exports = copy;