var fs = require('fs');
var atomFs = require('fs-plus');
var fs2 = require('fs-extra');
var path = require('path');

var globalDefaultOptions = {
	load: {
		c: 'a', d: 'a'
	},
	save: {
		c: 'mq', d: 'q'
	}
};

/**
 * 创建一个配置对象通过配置文件路径
 * @param  {string|undefined} cfgPath 默认当前目录下的config.json
 */
var Cfg = function(cfgPath) {
	var self = this;
	
	var _cfgObj = fs2.readJSONSync(this.cfgFilePath = (cfgPath || 'usync.config.json') );

	//让配置文件的一些可选值保证有值
	if (!_cfgObj.baseDir)
		_cfgObj.baseDir = './';
	if (!_cfgObj.indexsDir) //索引文件夹位置及创建
		_cfgObj.indexsDir = path.join(_cfgObj.baseDir, 'indexs');
	//创建文件夹
	fs2.mkdirsSync(_cfgObj.indexsDir);
	if (!_cfgObj.profileSet)
		_cfgObj.profileSet = {};	

	this.cfgObj = _cfgObj;

	/**
	 * 使用配置文件的其他参数作为基础, 获得指定name的配置的内容对象
	 * @param  {string} name
	 * @param  {string} action
	 * @param  {object} argsObj
	 */
	this.getProfileContent = function (name, action, argsObj) {
		var _obj = _cfgObj.profiles[name];
		if (!_obj.defaultOptions) _obj.defaultOptions = {};
		if (!_obj.defaultOptions.load) _obj.defaultOptions.load = {};
		if (!_obj.defaultOptions.save) _obj.defaultOptions.save = {};
		var result = {
			path: path.resolve(path.join(_cfgObj.baseDir, _obj.path) ),
			exportPath: path.resolve(self.converPathHasEnvVar(_obj.exportPath)),
			indexFile: path.resolve(path.join(_cfgObj.indexsDir, name + '.json') ),
			ignore: _obj.ignore || []
		};
		var op = globalDefaultOptions[action];
		//优先级最低: 全局默认选项
		for (var key in op) 
			result[key] = op[key];
		//优先级提高一层: 配置文件指定默认选项
		op = _obj.defaultOptions[action];
		for (var key in op) 
			result[key] = op[key];
		//最高优先级,用户输入选项
		for (var key in argsObj) 
			result[key] = argsObj[key];
		return result;
	};
	
	/**
	 * 判断一个Profile存在并且必要的参数不少
	 * @param  {string} name Profile名
	 * @param {boolean} output 是否显示必要输出:(默认:true)
	 */
	this.isProfileLegal = function (name, output) {
		var profile = _cfgObj.profiles[name];
		output = (output == void 0) ? true : !!output;//默认为输出
		if (!profile)
			return (output && console.error('指定配置不存在!')), false;
		if (profile.exportPath && profile.path)
			return true;
		return (output && console.error('配置属性缺失!') ), false;
	};
	
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
		return [name];
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