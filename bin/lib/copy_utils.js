//var fs = require('fs');
var fs2 = require('fs-extra');
var path = require('path');
var yn = require('./yesno_utils.js');

var indexs = { m: 0, t: 1, s: 2 };
var words = [
	'文件md5不同,是否需要覆盖',
	'文件相比更新,是否需要覆盖',
	'文件尺寸不同,是否需要覆盖'
];
var copy =  {
	"shouldCopy": function (fname, fromInfo, toInfo, coverMethod, coverQuest) {
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
		return coverQuest ? yn(words[index] + '(' + fname + ')', true) : true;
	},

	"onError": function (error) {
		console.error('同步出错!');
		console.error(error);
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
		var coverQuest = coverAttr[1] == 'q';
		var modify = {};
		for (var filename in fromFileInfos) {
			if (copy.shouldCopy(filename, fromFileInfos[filename], toFileInfos[filename], coverMethod, coverQuest)) {
				modify[filename] = fromFileInfos[filename];
				var distTaret = path.join(toPath, filename);
				// fs2.mkdirsSync(path.dirname(distTaret));
				fs2.copySync(path.join(fromPath,filename), distTaret);
			}	
		}
		return modify;
	}
};

module.exports = copy;