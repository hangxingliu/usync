var fs = require('fs');
var atomFs = require('fs-plus');
var fs2 = require('fs-extra');
var path = require('path');
/**
 * 创建一个配置对象通过配置文件路径
 * @param  {string|undefined} cfgPath 默认当前目录下的config.js
 */
var Cfg = function(cfgPath) {
	var self = this;
	
	var _cfgObj = fs2.readJSONSync(cfgPath || 'config.js');

	//让配置文件的一些可选值保证有值
	if (!_cfgObj.baseDir)
		_cfgObj.baseDir = './';
	if (!_cfgObj.profileSet)
		_cfgObj.profileSet = {};	

	this.cfgObj = _cfgObj;
	
	/**
	 * 获得Profile的集合
	 * @param  {strin} name 配置名,配置集合名,all
	 * @return {string[]}
	 */
	this.getProfiles = function (name) {
		if (name == 'all') {
			var result = [];
			for (var i in _cfgObj.profiles) 
				result.push(i);
			return result;
		}
		if (_cfgObj.profileSet[name])
			return _cfgObj.profileSet[name];
		return [_cfgObj.profiles[name] ];
	};

	this.converPathHasEnvVar = function (p) {
		p = p.replace(/%(\w+)%/g, function (_, name) {
			return process.env[name] || '';
		});
		return path.resolve(p);
	};
}

module.exports = function (cfgPath) {
	return new Cfg(cfgPath);
};