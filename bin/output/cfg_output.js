// 用于显示配置信息的脚本
var colors = require('colors');
var path = require('path');

var thiz = {
	/**
	 * 返回可供打印的配置信息的方法
	 * @param  {object} cfg 配置对象
	 * @param  {string} profileName 用于筛选的配置名
	 * @return {string}
	 */
	'getListCfg': function (cfg, profileName) {
		var cfgObj = cfg.cfgObj;
		var filter = profileName || '';
		var str = [
			'当前使用配置文件: ' + (path.resolve(cfg.cfgFilePath) ).cyan,
			'USB上的基准路径: ' + (path.resolve(cfgObj.baseDir) ).cyan
		];
		str.push('可用配置名:');
		for (var name in cfgObj.profiles)
			if (!filter || name.indexOf(filter) >= 0)	
				str.push(('\t' + name).green );
		str.push('可用配置集名:');
		for (var name in cfgObj.profileSet)
			if (!filter || name.indexOf(filter) >= 0)	
				str.push(('\t'+name+'\n\t\t'+JSON.stringify(cfgObj.profileSet[name])).blue );	

		return str.join('\n');
	},
};

module.exports = thiz;