var exec = require('child_process').exec;
var colors = require('colors');
var path = require('path');
var copy = require('../lib/copy_utils.js');
var fs2 = require('fs-extra');
var atomFs = require('fs-plus');
var baseCommand = '7z';

var _7z = {
	'load': function (subtype, profileName, profile, done, output) {
		var tmpFile = path.resolve(
			path.join(path.dirname(profile.exportPath), '~7z_' + profileName + '.' + subtype) );
		fs2.copy(profile.path, tmpFile, function (e) {
			output && (e ? console.error('复制压缩文件出错!'.red) : console.log('压缩文件复制成功!'.green) );
			e || _7z.extract(tmpFile, profile.exportPath, profile.c == 'n' ? 's' : 'a', function (e) {
				e || fs2.removeSync(tmpFile);
				done();
			}, output);
		});
	},
	'save': function(subtype, profileName, profile, done, output) {
		_7z.compress(subtype, profile.exportPath, path.dirname(profile.exportPath), '~7z_' + profileName,
			function(e, fname) {
				if (e)
					return done(e);
				_7z.save_checkCopyAndDelete(fname, fname, profile.path, profile.c, done, output);
			}, output);
	},
	'save_checkCopyAndDelete': function(fname, src, dist, c, done, output) {
		var srcInfo = fs2.statSync(src);
		var distInfos = [];
		if (fs2.existsSync(dist)) {
			var distInfo = fs2.statSync(dist);
			distInfos = [atomFs.md5ForPath(dist), distInfo.mtime, distInfo.size];
		}
		if (copy.shouldCopy(fname, [
				atomFs.md5ForPath(src), srcInfo.mtime, srcInfo.size
			], distInfos, c[0], c[1] == 'q'))
			fs2.copy(src, dist, function(e) {
				output && (e ? console.error('复制压缩文件出错!'.red) : console.log('压缩文件复制成功!'.green) );
				e || fs2.removeSync(src);
				done();
			});
		else
			(output && console.log('无变化') ), done();
	},

	/**
	 * 将src目录下的所有文件压缩到dist目录下的name.xxx文件内
	 * @param  {string} subtype
	 * @param  {string} src
	 * @param  {string} dist
	 * @param  {string} name
	 * @param  {function} done
	 * @param  {boolean} output 是否输出调试信息
	 */
	'compress': function(subtype, src, dist, name, done, output) {
		var fname = name + '.' + subtype;
		fname = path.resolve(path.join(dist, fname));
		src = path.resolve(src);
		src = src.match(/[\\\/]$/) ? src + '.' : src + path.sep + '.';
		exec(baseCommand + ' a "' + fname + '" "' + src + '" -r', function(e, out, err) {
			output && (e ? console.error(('压缩文件 ' + path.basename(fname) + ' 创建失败!(7z)').red) : console.log(('压缩文件创建成功!').cyan));
			done(e, fname);
		});
	},
	'extract': function(archive, dist, overwrite, done, output) {
		archive = path.resolve(archive);
		dist = path.resolve(dist);
		exec(baseCommand + ' x "' + archive + '" -ao' + overwrite +
			' "-o' + dist + '" -r',
			function(e, out, err) {
				output && (e ? console.error(('解压文件 ' + path.basename(archive) + ' 失败!(7z)').red) : console.log(('解压文件至 ' + dist + ' 成功!').cyan));
				done(e);
			});
	}
};

module.exports = _7z;