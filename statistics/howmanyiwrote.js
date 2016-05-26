var path = require('path');
var atomFs = require('fs-plus');
var fs = require('fs');
var now = process.cwd();
if (!now.match(/usync$/gi)) {
	console.error('请在USync根目录执行此统计!');
} else {
	statistics('bin', '源代码  ');
	statistics('test', '单元测试');
}

function statistics(path, name) {
	var srcs = atomFs.listTreeSync(path);
	var lines = 0;
	var chars = 0;
	var files = 0;
	for (var i in srcs) {
		if (atomFs.isDirectorySync(srcs[i])) continue;
		var ct = fs.readFileSync(srcs[i], 'utf-8');
		var start = 0;
		while ((start = ct.indexOf('\n', start) + 1) > 0) lines++;
		chars += ct.length;
		files ++;
	}
	console.log(name, '文件数:\t'+files, '行数:\t'+lines ,'字数:\t'+chars);
}