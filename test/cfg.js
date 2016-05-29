var should = require('chai').should();
var path = require('path');

var Cfg = require('../bin/lib/cfg_utils.js');
var Texts = require('../bin/output/cfg_output.js');

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

	it('判断配置是否有效', function() {
		cfg.isProfileLegal('vscode1', 0).should.be.ok;
		cfg.isProfileLegal('vscode1', 0, ['7z']).should.be.ok;
		cfg.isProfileLegal('vscode1', 0, ['8z', '9z']).should.be.not.ok;
		cfg.isProfileLegal('vscode2', 0).should.be.not.ok;
		cfg.isProfileLegal('vscode3', 0).should.be.not.ok;
	});

	it('获得配置的详细内容', function() {
		cfg.getProfileContent('vscode1', 'save', { 'y': '' }).should.has.key(
			'path', 'exportPath', 'indexFile', 'ignore', 'c', 'd', 'y', 'type', 'subtype')
			.and.satisfy(function(data) {
				for (var i in data)
					if (data[i] === void 0)
						return false;
				return true;
			}).and.has.property('subtype', 'tar');
		cfg.getProfileContent('vscode2', 'save').should.has.property('type', 'files');
	});

	it('获得配置的描述信息', function () {
		Texts.getListCfg(cfg).should.contain('Profiles').and.contain('config.json')
			.and.contain('vscode1').and.contain('\n');
	});
	
	it('获得配置的描述信息, 包含筛选配置名', function () {
		var info = Texts.getListCfg(cfg, 'vscode2');
		info.should.has.contain('vscode2').and.has.not.contain('vscode1');
	});
});