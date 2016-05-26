var should = require('chai').should();
var fs2 = require('fs-extra');
var atomFs = require('fs-plus');
var path = require('path');

var file = require('../bin/lib/file_utils.js');
var copy = require('../bin/lib/copy_utils.js');

describe('复制文件测试', function () {
	var distPath = 'test/env4copy/to';
	var srcPath = 'test/env4copy/from';
	var srcInfos = file.genFilesInfo(srcPath, file.listTreeRelative(srcPath, srcPath, []));
	var distInfos = {};
	beforeEach(function () {
		fs2.removeSync(distPath);
		fs2.mkdirsSync(distPath);
		distInfos = {};
	});
	it('无覆盖模式', function () {
		copy.copy(srcPath, distPath, srcInfos, distInfos, 'n').should.has.keys('1.txt', '2.txt', 'sub/1.txt');
		checkDistFilesNumber(4);
	});
	it('无覆盖模式,存在一个文件', function () {
		distInfos['1.txt'] = [];
		copy.copy(srcPath, distPath, srcInfos, distInfos, 'n').should.has.keys('2.txt', 'sub/1.txt');
		checkDistFilesNumber(3);
	});
	it('尺寸覆盖模式', function () {
		distInfos['1.txt'] = ['', 0, 0];
		distInfos['2.txt'] = ['', 0, srcInfos['2.txt'][2]];
		copy.copy(srcPath, distPath, srcInfos, distInfos, 's').should.has.keys('1.txt', 'sub/1.txt');
		checkDistFilesNumber(3);
	});
	it('时间覆盖模式', function () {
		distInfos['1.txt'] = ['', 0, 0];
		distInfos['2.txt'] = ['', srcInfos['2.txt'][1] + 1024, 0];
		copy.copy(srcPath, distPath, srcInfos, distInfos, 't').should.has.keys('1.txt', 'sub/1.txt');
		checkDistFilesNumber(3);
	});
	it('MD5覆盖模式', function () {
		distInfos['1.txt'] = ['', 0, 0];
		distInfos['2.txt'] = [ srcInfos['2.txt'][0], 0, 0];
		copy.copy(srcPath, distPath, srcInfos, distInfos, 'm').should.has.keys('1.txt', 'sub/1.txt');
		checkDistFilesNumber(3);
	});
	it('强制覆盖模式', function () {
		distInfos['1.txt'] = srcInfos['1.txt'];
		distInfos['2.txt'] = srcInfos['2.txt'];
		copy.copy(srcPath, distPath, srcInfos, distInfos, 'a').should.has.keys('1.txt', '2.txt', 'sub/1.txt');
		checkDistFilesNumber(4);
	});
	
	function checkDistFilesNumber(num) {
		atomFs.listTreeSync(distPath).should.be.length(num);
	}	
});

