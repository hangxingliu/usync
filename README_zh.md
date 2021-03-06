# usync
> 刘越 写的一套基于Nodejs的同步脚本
> USync Github项目首页: [https://github.com/hangxingliu/usync](https://github.com/hangxingliu/usync)   
> 刘越的Github: [https://github.com/hangxingliu](local://base_request.html/)

## 即将来到的功能
1. 清除多余的文件
2. 忽略文件的列表
3. 脚本-i18n支持

## 开源协议
[GPL-2.0](LICENSE)

## 我为什么要写这套脚本
利用我的U盘在许多电脑间工作与数据同步(保持工作环境统一,数据方便同步)

## 如何使用

### 基本命令
```
	sync <action> { <configName> | all } [ [ -<optionName>[<optionValue>] ] ... ]
```

### 文件覆盖规则 ( -c )

```
	-c{ a | s | m | t | n}[q]
```
- `a`: 覆盖素有
- `s`: 覆盖不同尺寸的文件
- `m`: 覆盖不同MD5的文件
- `t`: 覆盖旧的文件
- `n`: 不覆盖

- `q`: 需要覆盖的时候请询问我(Y/n)

### Delete redundant files rule ( -d ) (TODO)
```
	-d{ a | n | q }
```
- `a`: all
- `n`: none
- `q`: quest me(Y/n)

### Yes for confirm action ( -y )
```
	-y
```

### 指定配置文件 (-f)
```
	-f<configFilePath>
```

### Action: load, use, usb2pc
把文件从U盘复制到电脑

### Action: save, pc2usb
从电脑保存文件到U盘

### Action: build, index
重建U盘内文件的缓存信息

### Action: clean, clear, leave
清除留着电脑中的文件/痕迹

### Action: cleanusb, clearusb
清除U盘中的文件

### Action: list
```
	list [<searchString>]
```
列举可用配置,可用配置集

## 配置 `usync.config.json`.
``` javascript
{
	"baseDir": ".", //可选, U盘内文件的基准目录
	"indexsDir": "usync.indexs",//可选, U盘内文件的缓存信息存放目录
	"includes": ["sub_config1.json", "..."],//可选, 如果你需要谢多个配置文件
	"profiles": {//配置对象
		"PROFILE_NAME": {//配置名
			"description": "",//可选, 这个配置的描述
			"type":"files",//可选, 默认: files, 如果你需要文件归档格式,可以使用例如: 7z~tar,7z~zip ....
			"path": "",//在U盘基准目录下的相对路径
			"exportPath": "",//在电脑中的存放路径,可以使用环境变量
							// 例如: "%USERPROFILES%\\xxx")
			"defaultOptions": {//指定Action的选项
				"load": {"c": "a","d": "q"}	
			},
			"ignore": ["*.js"]//通过glob的文件忽略数组
		}//...
	},
	"profileSet": {
		"PROFILE_SET_NAME": [
			"profileName1", "profileName2"//...
		 ]//...
	}
}

```
