// 用于显示配置信息的脚本
var colors = require('colors');
var path = require('path');

var thiz = {


	'getDiff': function (diffInfos, oldInfos) {
		var add = [],
			del = [],
			modi = [];
		for (var i in diffInfos) {
			if (!diffInfos[i])
				del.push('\t' + i);
			else if (!oldInfos[i])
				add.push('\t' + i);
			else modi.push('\t' + i);
		}
		var str = [
			'差异文件数: ' + ((add.length + del.length + modi.length) + '').blue
		];
		if (add.length) {
			str.push('+ 增加: ' + (add.length + '').green);
			for (var i in add)
				str.push(add[i].green);
		}
		if (modi.length) {
			str.push('  修改: ' + (modi.length + '').cyan);
			for (var i in modi)
				str.push(modi[i].cyan);
		}
		if (del.length) {
			str.push('- 删除: ' + (del.length + '').red);
			for (var i in del)
				str.push(del[i].red);
		}
		if (!add.length && !modi.length && !del.length)
			str.push('--无差异');	
		return str.join('\n');
	},
};

module.exports = thiz;