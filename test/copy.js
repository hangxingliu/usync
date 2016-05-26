var should = require('chai').should();
var atomFs = require('fs-plus');

var file = require('../bin/lib/file_utils.js');
var copy = require('../bin/lib/copy_utils.js');

describe('复制文件测试', function () {
	beforeEach(function () {
		atomFs.removeSync('test/env4copy/to');
	});
	it('无覆盖模式', function() {
		(1).should.be.true;
	});
});