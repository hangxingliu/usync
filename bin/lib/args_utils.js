module.exports = {

	/**
	 * 获得属于usync的启动参数数组
	 * @param {string[]} argv process.argv
	 * @return {string[]}
	 */
	'getArgs': function(argv) {
		for (var i in argv)
			if (argv[i].match(/\.js$/gi))
				break;
		return argv.slice(parseInt(i) + 1);
	},
	/**
	 * 用usync的参数中解析成对象
	 * @param  {string[]} argv usync参数数组
	 * @return {object}
	 */
	'analyzeArgs': function (argv) {
		var result = {
			action: argv[0],
			profileName: argv[1]
		};
		//获得附加选项
		for (var i in argv) {
			if (argv[i].match(/^-/g)) {
				result[argv[i][1]] = argv[i].slice(2); continue;
			}
		}
		return result;
	}
};