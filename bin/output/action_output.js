// 用于显示配置信息的脚本
var colors = require('colors');

var words = {
	'a': '',
	's': '(尺寸)',
	'm': '(Md5)',
	't': '(时间)'
}

var thiz = {
	'getCoverDesc': function(c) {
		if (c[0] == 'n')
			return '从不'.gray;
		if (c[1] == 'q')
			return ('询问' + words[c[0]]).green;
		if (c[0] == 'a')
			return '全部'.red;
		return words[c[0]].gray;
	},

	'getActionConfirm': function (actionId, profileName, profile) {
		switch (actionId) {
			case 1:
				return '确定加载配置 ' + profileName.underline.gray +
					' 的此计算机 ,覆盖模式:' + thiz.getCoverDesc(profile.c);
			case 2:
				return '确定此保存配置 ' + profileName.underline.gray +
					'到U盘,覆盖模式:' + thiz.getCoverDesc(profile.c);
			case 3:
				return '确认重建配置 ' + profileName.underline +
					' 的文件信息';
			case 4:
				return ('确认清除此计算机中 ' + profileName.underline +
					' 配置的文件').magenta;
			case 5:
				return ('确认清除 U盘 中 ' + profileName.underline +
					' 配置的文件').red;
		}
		return '';
	},
};

module.exports = thiz;