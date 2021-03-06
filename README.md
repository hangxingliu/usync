# usync
> A USB Sync Script based on Nodejs by LiuYue   
> USync Project Github: [https://github.com/hangxingliu/usync](https://github.com/hangxingliu/usync)   
> LiuYue's Github: [https://github.com/hangxingliu](local://base_request.html/)

## Coming soon
1. Delete redundant files
2. Ignore files
3. Support i18n

## License
[GPL-2.0](LICENSE)

## Why I make it
I need use some software in many different computers with same configurations and same extensions, and I dont want leave some traces after I used an others computer.

And I have a Sanddisk Extreme Pro USB 3.0 Disk. So I decide use this USB disk to become a middleman between my computer and others computer.(I copy my config extension and software from my computer to my USB disk and copy these from mu USB disk to others computer)

Finish, as a wheel maker.I wrote this tools named `usync`
used to batch transfer files, folders, archives and clean traces between computer and USB disk). 

## How to use

### Basic command
```
	sync <action> { <configName> | all } [ [ -<optionName>[<optionValue>] ] ... ]
```

### files Cover rule ( -c )

```
	-c{ a | s | m | t | n}[q]
```
- `a`: Cover all
- `s`: Cover Size different files
- `m`: Cover MD5 different files
- `t`: Cover Time later files
- `n`: Cover none

- `q`: If should cover ,please quest me(Y/n)

### Delete redundant files rule ( -d ) (TODO)
```
	-d{ a | n | q }
```
- `a`: all
- `n`: none
- `q`: quest me(Y/n)

### Yes for confirm action ( -y )
```
	-y[!]
```
- `!`: No for confirm action(Using for action you dont want to execute);

### special config File (-f)
```
	-f<configFilePath>
```

### Action: load, use, usb2pc
copy files from usb disk to hraddisk(computer)

### Action: save, backup, pc2usb
copy files to usb disk 

### Action: build, index
rebuild(index) files info in usb disk

### Action: clean, clear, leave
clear the traces in computer

### Action: cleanusb, clearusb
clear the files in usb disk

### Action: list
```
	list [<searchString>]
```
list profiles and profile set.

## How to config `usync.config.json`.
``` javascript
{
	"baseDir": ".", //Optional, The usb disk files base folder
	"indexsDir": "usync.indexs",//Optional, The usb disk files index files store folder
	"includes": ["sub_config1.json", "..."],//Optional, If you want to write config in many files
	"profiles": {//Profiles object
		"PROFILE_NAME": {//Profile name
			"description": "",//Optional, This profile's description
			"type":"files",//Optional, default is files, you use other archive type, such as 7z~tar,7z~zip ....
			"path": "",//Usb disk files path based on baseDir
			"exportPath": "",//files in computer path(could use system environment path,
							// such as: "%USERPROFILES%\\xxx")
			"defaultOptions": {//Default Option in specified action
				"load": {"c": "a","d": "q"}	
			},
			"ignore": ["*.js"]//Ignore file expression array(glob)
		}
	},
	"profileSet": {
		"PROFILE_SET_NAME": [
			"profileName1", "profileName2"//...
		 ]//...
	}
}

```
