var should = require('chai').should();

var _7z = require('../bin/archive/7z.js');


describe('7z压缩测试', function() {
	it('压缩', function(done) {
		_7z.compress('tar', 'test/env', 'test/envArchive', 'tmpTar', function (e, fname) {
			fname.should.be.contain('tmpTar.tar');
			done(e);
		}, 0);
	});
	it('解压', function(done) {
		_7z.extract('test/envArchive/tmpTar.tar', 'test/envArchive/test_extra', 'a', function () {
			_7z.extract('test/envArchive/tmpTar.tar', 'test/envArchive/test_extra', 's', done, 0);
		}, 0);
	});
	it('保存(复制,比较,删除压缩包)', function(done) {
		_7z.save('tar', 'testProfile', {
			path: 'test/envArchive/tarInUSB.tar',
			exportPath: 'test/envArchive/test_extra',
			c: 'a'
		}, done, 0);
	});
	it('加载(复制,解压压缩包)', function(done) {
		require('fs-extra').removeSync('test/envArchive/test_extra');
		_7z.load('tar', 'testProfile', {
			path: 'test/envArchive/tarInUSB.tar',
			exportPath: 'test/envArchive/test_extra',
			c: 'a'
		}, done, 0);
	});
});