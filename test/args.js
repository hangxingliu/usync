var should = require('chai').should();

var utils = require('../bin/lib/args_utils.js');

describe('获取解析参数', function() {
	var oriParams = [
		'G:\\DevTools\\nodejs\\node.exe',
		'H:\\System\\USync\\bin\\usync.js',
		'test', 'units', '-cm'
	];
	it('获得属于usync的参数', function() {
		var params = utils.getArgs(oriParams);
		params.should.be.length(3);
		params.should.be.contain('test');
		params.should.be.contain('units');
	});

	it('解析属于usync的参数', function() {
		var params = utils.getArgs(oriParams);
		var params = utils.analyzeArgs(params);
		params.action.should.be.equal('test');
		params.profileName.should.be.equal('units');
		params.c.should.be.equal('m');
	});

});