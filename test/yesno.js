var should = require('chai').should();

var yn = require('../bin/lib/yesno_utils.js');

describe('测试输入Yes/No', function () {
	it.skip('测试输入Yes(无法用自动测试)', function () {
		console.log('Yes/No请在10秒内输出完成!');
		yn(1, 1).should.true;
	});
	it.skip('测试输入No(无法用自动测试)', function () {
		console.log('Yes/No请在10秒内输出完成!');
		yn(1, 0).should.false;
	});
});