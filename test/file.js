var should = require('chai').should();

var utils = require('../bin/lib/file_utils.js');

// var fse = require('fs-extra');
// var fsp = require('fs-plus');

describe('文件信息获取相关测试', function () {
	it('不带筛选的递归获取文件路径(相对)信息', function () {
		utils.listTreeRelative('test/env', 'test').should.be.length(3).and.satisfy(function (data) {
			//验证是否为相对路径
			for (var i in data)
				if (!data[i].match(/^env/gi))
					return false;
			return true;
		});
	});
	it('带筛选条件的递归获取文件路径(相对)信息', function () {
		utils.listTreeRelative('test/env', 'test', ['**/*.js']).should.be.length(2);
	});
	it('通过文件相对路径数组获得文件信息对象', function () {
		var files = utils.listTreeRelative('./test/env', './test', ['env/sub/*']);
		var info = utils.genFilesInfo('./test', files);
		var checkObj = info['env/test.txt'];
		info.should.has.property('env/test.txt');
		checkObj[0].should.be.eql(require('md5')('123456'));
		checkObj[1].should.be.above(1464258423000);
		checkObj[2].should.be.eql(6);
	});

	it('通过文件相对路径数组获得文件信息对象 覆盖原有信息版', function () {
		var oldInfos = {
			'env/test.txt': [0, 0, 0],
			'env/test2.txt': [0, 0, 0]
		};
		var files = utils.listTreeRelative('./test/env', './test', ['env/sub/*']);
		var info = utils.genFilesInfo('./test', files ,oldInfos);
		var checkObj = info['env/test.txt'];
		info.should.has.property('env/test2.txt');
		checkObj[0].should.be.eql(require('md5')('123456'));
		checkObj[1].should.be.above(1464258423000);
		checkObj[2].should.be.eql(6);
	}); 
	it('通过文件相对路径数组获得文件信息对象 覆盖原有信息版', function () {
		var updateInfo = {
			'env/test.txt': [0, 0, 0],
			'env/test2.txt': [0, 0, 0]
		};
		var files = utils.listTreeRelative('./test/env', './test', ['env/sub/*']);
		var info = utils.genFilesInfo('./test', files);
		var info = utils.updateFilesInfo(updateInfo, info);
		var checkObj = info['env/test.txt'];
		checkObj[0].should.be.eql(0);
		checkObj[1].should.be.eql(0);
		checkObj[2].should.be.eql(0);
	});

	it('比较两个文件信息数组', function () {
		var info1 = ['xxxx', 10086, 5];
		var info2 = ['xxxx', 10086, 5];
		var info3 = ['xxxx', 10087, 5];
		utils.compareFileInfo(info1, info2).should.be.true;
		utils.compareFileInfo(info1, info3, true).should.be.true;
		[utils.compareFileInfo(info1, info3)].should.be.eql([1]);
	});


	it('比较两组文件信息对象', function () {
		var oldInfo = {
			'hadDelete': [0, 1, 2],
			'hadModify': [0, 1, 2],
			'normal':	 [0, 1, 2],	
		};
		var newInfo = {
			'hadAdd':	 [0, 1, 2],
			'hadModify': [1, 1, 2],
			'normal':	 [0, 1, 2],	
		};
		var diffInfo = utils.diffFilesInfo(newInfo, oldInfo);
		diffInfo.should.has.all.keys('hadAdd', 'hadModify', 'hadDelete');
		diffInfo['hadDelete'].should.be.empty;
		diffInfo['hadModify'][0].should.be.eql(1);
	});
});