var args = require('./lib/args_utils.js');
var Cfg = require('./lib/cfg_utils.js');
var copy = require('./lib/copy_utils.js');
var file = require('./lib/file_utils.js');
var yn = require('./lib/yesno_utils.js');

var legalAction = {
	'load': 0,
	'save': 1,
	'build': 2,
	'clean': 3,
	'cleanusb': 4
};

function main() {
	var params = args.analyzeArgs(args.getArgs(process.argv));
	var cfg = Cfg(void 0);
	if (!(params.action in legalAction)) {
		console.error('未知操作: ' + params.action + '!');
		return 1;
	}
	if (!params.profileName) {
		console.error('请输入配置名!');
		return 1;
	}
	var profiles = cfg.getProfiles(params.profileName);
	for (var pi in profiles) {
		var profileName = profiles[pi];
		if (!cfg.isProfileLegal(profileName)) {
			return 1;
		}
		var profile = cfg.getProfileContent(profileName, params.action, params);
		console.log('配置名:', profileName, '操作:', params.action, '覆盖模式:', profile.c, '冗余清除模式:', profile.d, '(Y/n)');
		if (!yn(0, 1))
			return 1;
		
	}
	return 0;
}

var ret = main();
process.exit(ret);
