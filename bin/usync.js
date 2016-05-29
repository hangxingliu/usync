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
//需要执行的配置的队列
var profileHandlerList = [];

//获得传入usync的参数
var params = args.analyzeArgs(args.getArgs(process.argv));
//获得配置文件
var cfg = Cfg(params.configFile);
//操作
var action = params.action;
//操作ID
var actionID = legalAction[action] || error('未知操作: ' + action + ' !', 1);

if( actionID >= 100 ){
	// list操作
	handlerAction(params.profileName);
} else {
	//缺少配置名
	params.profileName || error('请输入配置名!', 1);

	//获取需要执行的配置名的队列
	profileHandlerList = cfg.getProfiles(params.profileName);

	//开始配置队列执行
	handlerProfileList();
}

//--------------------------------------------------------------------------
//-------------- Function -- Block -- Start --------------------------------
//--------------------------------------------------------------------------


/**
 * 根据action信息,执行一个action
 * @param  {number} actionID
 * @param  {Object} cfg
 * @param  {string} profileName
 * @param  {Object} profile
 * @return {number} 1: 已经通知调用下一次的handlerProfileList, 返回后无需调用,其他: 相反
 */
function handlerAction(profileName, profile) {
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
			if (profile.type != 'files')
				return archive(profile.type).load(profile.subtype, profileName, profile, handlerProfileList, 1), 1;
			
			return console.log(copy.copy(profile.path, profile.exportPath, usbInfos, cpInfos, profile.c));
		case 2: //save mode
			if (profile.type != 'files')
				return archive(profile.type).save(profile.subtype, profileName, profile, handlerProfileList, 1), 1;	
			
			var updateInfos = copy.copy(profile.exportPath, profile.path, cpInfos, usbInfos, profile.c);
			console.log(updateInfos);
			return usbInfos = file.saveFilesInfo(profile.indexFile, updateInfos, usbInfos);
		case 3: //build
			if (profile.type != 'files')
				return console.log('归档形式的同步无需构建文件信息缓存1');	
			var usbInfos2 = getUSBFileInfos(profile, 1);
			//输出差异
			console.log( output('file').getDiff( file.diffFilesInfo(usbInfos2, usbInfos), usbInfos ) );
			//保存最新的文件信息到文件
			return file.saveFilesInfo(profile.indexFile, usbInfos2);
	}
}

function handlerProfileList() {
	var profileName = profileHandlerList.shift();

	//配置列表全部完成
	if (!profileName)
		return console.log('-----------------------------\n\tUSync: 全部任务完成!') || process.exit(0);

	//判断配置是否合规
	if (!cfg.isProfileLegal(profileName))
		return error('配置 ' + profileName + ' 不合规!'), handlerProfileList();

	//获得配置内容
	var profile = cfg.getProfileContent(profileName, action, params);

	if (profile.y === '!')
		return error('配置 ' + profileName + ' 不允许此操作(-y!选项)!'), handlerProfileList();
	
	//提示确认操作
	if(profile.y === void 0)
		if(console.log(output('action').getActionConfirm(actionID, profileName, profile) + ' (Y/n)') ||
			!yn(0, 1))
				return error('操作已被阻止!'), handlerProfileList();

	// 执行操作
	handlerAction(profileName, profile) === 1 || handlerProfileList();
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
 * 获得某个类型的归档脚本(require('./archive/... .js'))
 * @param  {string} type
 */
function archive(type) {
	return require('./archive/'+type+'.js');
}

/**
 * 打印一串错误信息并退出
 * @param  {string} description = ''
 * @param  {boolean} exit 是否结束程序
 */
function error(description, exit) {
	console.error( require('colors/safe').red(description || '') );
	exit && process.exit(typeof exit == 'number' ? exit : 1);
}