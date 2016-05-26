var should = require('chai').should();
var path = require('path');

var Cfg = require('../bin/lib/cfg_utils.js');


describe('配置文件相关测试', function() {
	var cfg = Cfg('test/config.json');
	it('成功装载配置文件', function() {
		cfg.cfgObj.should.be.a('object');
		cfg.cfgObj.should.has.property('profiles');
	});
	it('转换含有环境变量的路径', function() {
		if (!process.platform.match(/^win/gi))
			return ('can not test it').should.be.a('string');
		var p = cfg.converPathHasEnvVar('%USERPROFILE%');
		p.should.not.contain('%');
		p.should.be.length.above(1);
	});

	it('获得某个配置或者配置集合', function() {
		var set;
		cfg.getProfiles('vscode').should.be.length(2);
		cfg.getProfiles('all').should.be.length(2);
		cfg.getProfiles('vscode1').should.be.length(1);
	});
});