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
	'list': 100
};

function handlerAction(actionID, cfg, profileName, profile) {
	switch (actionID) {
		case 100://查找列举配置(配置集)名的命令 list
			return console.log(output('cfg').getListCfg(cfg, profileName));
		case 4: //clean
			return file.removePath(profile.exportPath);
		case 5: //clean usb
			return file.removePath(profile.path), file.removePath(profile.indexFile);
	}

	var usbInfos = getUSBFileInfos(profile);
	var cpInfos = getCpFileInfos(profile);

	switch (actionID) {
		case 1: //load mode
			return console.log(copy.copy(profile.path, profile.exportPath, usbInfos, cpInfos, profile.c));
		case 2: //save mode
			var updateInfos = copy.copy(profile.exportPath, profile.path, cpInfos, usbInfos, profile.c);
			console.log(updateInfos);
			return usbInfos = file.saveFilesInfo(profile.indexFile, updateInfos, usbInfos);
		case 3: //build
			var usbInfos2 = getUSBFileInfos(profile, 1);
			//输出差异
			console.log( output('file').getDiff( file.diffFilesInfo(usbInfos2, usbInfos), usbInfos ) );
			//保存最新的文件信息到文件
			return file.saveFilesInfo(profile.indexFile, usbInfos2);
	}
}

function main() {
	//获得传入usync的参数
	var params = args.analyzeArgs(args.getArgs(process.argv));
	//获得配置文件
	var cfg = Cfg(void 0);
	//操作
	var action = params.action;
	//操作ID
	var actionID = legalAction[action] || errorExit('未知操作: ' + action + ' !');
	
	// list操作
	actionID >= 100 && (handlerAction(actionID, cfg, params.profileName), process.exit(0));
	
	//缺少配置名
	params.profileName || errorExit('请输入配置名!');
	
	var profiles = cfg.getProfiles(params.profileName);
	for (var pi in profiles) {
		var profileName = profiles[pi];

		//判断配置是否合规
		cfg.isProfileLegal(profileName) || errorExit('配置 ' + profileName + ' 不合规!');
		//获得配置内容
		var profile = cfg.getProfileContent(profileName, action, params);

		profile.y === '!' && errorExit('配置 ' + profileName + ' 不允许此操作(-y!选项)!');

		//提示确认操作
		profile.y !== void 0 || console.log(output('action').getActionConfirm(actionID, profileName, profile) + ' (Y/n)')
			|| yn(0, 1) || errorExit('操作已被阻止!');

		// 执行操作
		handlerAction(actionID, cfg, profileName, profile); 
	}
	return 0;
}

/**
 * 获得电脑内指定配置的文件的信息对象
 * @param  {object} profile
 */
function getCpFileInfos(profile) {
	return file.loadFilesInfo(jsonSuffixModifier(profile.indexFile, 'unsafe'), profile.exportPath);
}

/**
 * 获得USB指定配置的文件的信息对象
 * @param  {object} profile
 * @param  {boolean} force 强制获得保证最新的文件信息(不读取文件信息缓存文件)
 */
function getUSBFileInfos(profile, force) {
	return file.loadFilesInfo(force ? jsonSuffixModifier(profile.indexFile, 'new') :profile.indexFile , profile.path);
}

/**
 * 给一个json后缀的文件加入修饰符(加入位置:filename.modifier.json)
 * @param  {string} file
 * @param  {string} modifier
 */
function jsonSuffixModifier(file, modifier) {
	return file.replace(/\.json$/g, '.' + modifier + '.json')
}

/**
 * 获得某个类型的输出类脚本(require('./output/.._output.js'))
 * @param  {string} type
 */
function output(type) {
	return require('./output/'+type+'_output.js');
}

/**
 * 打印一串错误信息并退出
 * @param  {string} description = ''
 * @param  {number} errId = 1
 */
function errorExit(description, errId) {
	console.error( require('colors/safe').red(description || '') );
	process.exit(errId || 1);
}

process.exit(main());