var fs = require('fs');

/**
 * 提示输入yes/no
 * @param  {boolean} output 是否输出提示
 * @param  {boolean} defaultValue 默认值
 */
function yn(output, defaultValue) {
	var out = defaultValue ? '(Y/n):' : '(y/N):';
	output && fs.writeSync(process.stdout.fd, (typeof output == 'string') ? (output + ' ' + out) : out);
	process.stdin.pause();
	var res = fs.readSync(process.stdin.fd, 3, 0, "utf8")[0].trim().toLowerCase();
	process.stdin.resume();
	if (res == 'y')
		return true;
	if (res == 'n')
		return false;
	return !!defaultValue;
};
module.exports = yn;