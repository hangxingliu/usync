var args = require('./lib/args_utils.js');
var Cfg = require('./lib/cfg_utils.js');
var copy = require('./lib/copy_utils.js');
var file = require('./lib/file_utils.js');
var yn = require('./lib/yesno_utils.js');
var path = require('path');

var legalAction = {
	'load': 1,
	'save': 2,
	'build': 3,
	'clean': 4,
	'cleanusb': 5,
	'list': 6
};
/**
 * 给一个json后缀的文件加入修饰符(加入位置:filename.modifier.json)
 * @param  {string} file
 * @param  {string} modifier
 */
function jsonSuffixModifier(file, modifier) {
	return file.replace(/\.json$/g, '.' + modifier + '.json')
}

function main() {
	var params = args.analyzeArgs(args.getArgs(process.argv));
	var cfg = Cfg(void 0);
	var action = params.action;
	var actionID = legalAction[action];
	if (!actionID) {
		console.error('未知操作: ' + action + '!');
		return 1;
	}

	// list操作
	if (actionID == 6) {
		console.log(require('./output/cfg_output.js').getListCfg(cfg, params));
		return 0;
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
		var profile = cfg.getProfileContent(profileName, action, params);
		if(action != 3)
			console.log('配置名:', profileName, '操作:', action, '覆盖模式:', profile.c, '冗余清除模式:', profile.d, '(Y/n)');
		if (!yn(0, 1))
			return 1;
		var usbInfos = file.loadFilesInfo(profile.indexFile, profile.path);
		var cpInfos = file.loadFilesInfo(
			jsonSuffixModifier(profile.indexFile, 'unsafe'), profile.exportPath);

		switch (actionID) {
			case 2: //save mode
				var updateInfos = copy.copy(profile.exportPath, profile.path, cpInfos, usbInfos, profile.c);
				console.log(updateInfos);
				usbInfos = file.saveFilesInfo(profile.indexFile, updateInfos, usbInfos);
				break;
			case 1: //load mode
				var updateInfos = copy.copy(profile.path, profile.exportPath, usbInfos, cpInfos, profile.c);
				console.log(updateInfos);
				break;
			case 3: //build
				var usbInfos2 = file.loadFilesInfo(
					jsonSuffixModifier(profile.indexFile, 'new'), profile.path);
				console.log(
					require('./output/file_output.js').getDiff(
						file.diffFilesInfo(usbInfos2, usbInfos), usbInfos
					));
				file.saveFilesInfo(profile.indexFile, usbInfos2);
				break;
		}
	}
	return 0;
}

var ret = main();
process.exit(ret);