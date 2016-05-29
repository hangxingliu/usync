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
 * 将obj1和obj2合并成一个新的obj(注意:不一定是深拷贝)
 * @param  {any} obj1
 * @param  {any} obj2
 */
function objCombine(obj1, obj2) {
	if (typeof obj1 != 'object' || typeof obj2 != 'object')
		return obj1 || obj2;
	var obj = {};
	for (var i in obj1) {
		if (obj2[i])
			obj[i] = objCombine(obj1[i], obj2[i]);
		else
			obj[i] = obj1[i];	
	}
	for (var i in obj2) {
		if (!obj[i])
			obj[i] = obj2[i];	
	}
	return obj;
}

/**
 * 创建一个配置对象通过配置文件路径
 * @param  {string} cfgPath 默认当前目录下的config.json
 */
var Cfg = function(cfgPath) {
	var self = this;
	
	var _cfgObj = fs2.readJSONSync(this.cfgFilePath = cfgPath );
	this.cfgIncludeFiles = [];

	//如果有引用文件
	if (_cfgObj.includes) {
		var is = _cfgObj.includes;
		var basePath = path.dirname(path.resolve(cfgPath) );
		for (var i in is) {
			this.cfgIncludeFiles.push(is[i]);
			_cfgObj = objCombine(_cfgObj, fs2.readJSONSync( path.join(basePath, is[i]) ) );
		}	
	}
	
	//让配置文件的一些可选值保证有值
	if (!_cfgObj.baseDir)
		_cfgObj.baseDir = './';
	if (!_cfgObj.indexsDir) //索引文件夹位置及创建
		_cfgObj.indexsDir = path.join(_cfgObj.baseDir, 'indexs');
	//创建文件夹
	fs2.mkdirsSync(_cfgObj.indexsDir);
	//填补配置集的对象
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
		//配置原始对象
		var _obj = _cfgObj.profiles[name];
		if (!_obj.defaultOptions) _obj.defaultOptions = {};
		if (!_obj.defaultOptions.load) _obj.defaultOptions.load = {};
		if (!_obj.defaultOptions.save) _obj.defaultOptions.save = {};
		var result = {
			path: path.resolve(path.join(_cfgObj.baseDir, _obj.path) ),
			exportPath: path.resolve(self.converPathHasEnvVar(_obj.exportPath)),
			indexFile: path.resolve(path.join(_cfgObj.indexsDir, name + '.json') ),
			ignore: _obj.ignore || [],
		};
		//解析同步类型
		var type = _obj.type || 'files';
		var splitIndex = type.indexOf('~');
		result.type = splitIndex < 0 ? type : type.slice(0, splitIndex);
		result.subtype = splitIndex < 0 ? '' : type.slice(splitIndex + 1); 

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
	 * @param  {boolean} output 是否显示必要输出:(默认:true)
	 * @param  {string[]} allowType 允许的同步类型
	 */
	this.isProfileLegal = function (name, output, allowType) {
		var profile = _cfgObj.profiles[name];
		output = (output == void 0) ? true : !!output;//默认为输出
		if (!profile)
			return (output && console.error('指定配置不存在!')), false;
		var type = profile.type, typeOK = 0;
		//如果指定了同步类型,就检查类型是否合法
		if (type && type != 'files' && allowType) {
			type = type.slice(0, type.indexOf('~'));
			for (var i in allowType) {
				if (allowType[i] == type) {
					typeOK = 1;
					break;
				}
			}
			if (!typeOK)
				return (output && console.error('配置的类型不存在!')), false;
		}
		
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
			var env = process.env[name].split(path.delimiter)[0];
			return env || '';
		});
		return path.resolve(p);
	};
}

module.exports = function (cfgPath) {
	return new Cfg(cfgPath);
};