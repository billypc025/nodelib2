#!/usr/bin/env node
require('shelljs/global');
var g = require("../global");
var fs = require("fs");
var path = require("path");
var OS = require("os");
var opener = require("opener");
var timeTool = require("../utils/TimeTool");
var exec = require("child_process").exec;
var pathTool = require("../utils/pathTool");

var globalCmd = require("../utils/actionPool")();
//var addCmd = require("../utils/actionPool")();

var self = {globalCmd};

var os = OS.platform().indexOf("win32") >= 0 ? "win" : "unix";

pathTool.init(self);

(function ($scope)
{
	$scope.showUsage = function ()
	{
		var usage = __$readLibFile("./bin/cli-template/cli-usage");
		log.info(usage);
	}

	$scope.showSelectList = function ($selectList, $callBack)
	{
		var inquirer = require('inquirer');
		var selectOption = {
			type: "list",
			name: "value",
			message: "Select a Router File",
			choices: []
		};

		selectOption.choices = $selectList.concat();

		inquirer.prompt(selectOption).then(function ($answer)
		{
			$callBack($answer);
		});
	}

	$scope.checkInit = function ()
	{
		if (__projPath == "")
		{
			log.error("没有找到工程目录，请使用以下命令初始化工程目录！");
			log.info("nodecli init");
			process.exit();
		}
	}

	$scope.showMsg = function ($msg, $callBack)
	{
		var inquirer = require('inquirer');
		var question = {
			type: "input",
			name: "value",
			message: $msg
		};

		inquirer.prompt(question).then(function ($answer)
		{
			$callBack($answer.value);
		});
	}
})(self);

(function ()
{
	globalCmd.adds(init, update, open, start, run);
	globalCmd.add(add, {
		router: addRouter,
		server: addServer,
		module: addModule,
		test: addTest,
		bin: addBin,
	});
//	globalCmd.add(update);
//	globalCmd.add(open);
//	globalCmd.add(start);
//	globalCmd.add(run);
	globalCmd.log = function (...arg)
	{
		arg.unshift("[nodecli]")
		global.log.info(arg.join(" "));
	}
//	addCmd.add("router", addRouter);
//	addCmd.add("server", addServer);
//	addCmd.add("module", addModule);
//	addCmd.add("test", addTest);
//	addCmd.add("bin", addBin);
})();

(function ()
{
	if (__$projExist("nodelib.config.js"))
	{
		var configJs = require(__$projPath("nodelib.config.js"));
		if (configJs.plugins && Array.isArray(configJs.plugins))
		{
			for (var plugin of configJs.plugins)
			{
				if (typeof plugin == "object" && typeof plugin.apply == "function")
				{
					plugin.apply(self);
				}
			}
		}
	}
}());

if (!globalCmd.exe.apply(globalCmd.exe, getArgs()))
{
	if (process.argv[1] &&
		(process.argv[1].indexOf("cli.js") == process.argv[1].length - 6
		|| process.argv[1].indexOf("nodecli") == process.argv[1].length - 7))
	{
		self.showUsage();
		process.exit();
	}
}

function init()
{
	var dirList = ["log", "module", "router", "node_modules"];
	globalCmd.log("Init Project Start");

	if (!__$projExist("./package.json"))
	{
		__$copy_lib2proj("./bin/cli-template/package.json", "./package.json");
		trace("Create File: " + __$projPath("./package.json"));
	}

	if (!__$projExist("./.gitignore"))
	{
		__$copy_lib2proj("./.gitignore", "./.gitignore");
		trace("Create File: " + __$projPath("./.gitignore"));
	}

	for (var i = 0; i < dirList.length; i++)
	{
		var dirName = dirList[i];
		if (!__$projExist(dirName))
		{
			g.fs.mkdirSync(__$projPath(dirName));
			trace("Create Directory: " + dirName);
		}
	}

	updateFile();

	globalCmd.log("Project is Inited!");
	process.exit();
}

function add($cmd, ...arg)
{
	self.checkInit();

	if (!$cmd.exe.apply($cmd.exe, arg))
	{
//		self.showUsage();
		process.exit();
	}
}

function update()
{
//	self.checkInit();

	exec("git --git-dir=" + __libPath + ".git --work-tree=" + __libPath + " checkout .", function (e, d)
	{
		exec("git --git-dir=" + __libPath + ".git --work-tree=" + __libPath + " pull", function (e, d)
		{
			trace("Update nodeLib Complete.");

			var editInfo = os == "win" ? "#" + "!" + "node" : "#" + "!" + "/usr/bin/env" +
			" node";
			var packageJson = require("../package.json");
			if (packageJson.bin && Object.keys(packageJson.bin).length > 0)
			{
				for (var k in packageJson.bin)
				{
					var file = path.join(__libPath, packageJson.bin[k]);

					if (!fs.existsSync(file))
					{
						if (file.indexOf(".js") != file.length - 3)
						{
							file += ".js";
						}

						if (!fs.existsSync(file))
						{
							trace("检查到不存在的bin文件: " + file);
						}
					}
					else
					{
						var fileContent = fs.readFileSync(file).toString();
						fileContent = fileContent.replace(new RegExp("#" + "!.+", "g"), "{$" + "EDIT_INFO}");
						if (fileContent.indexOf("{$" + "EDIT_INFO}") >= 0)
						{
							fileContent = fileContent.replace("{$" + "EDIT_INFO}", editInfo);
						}
						else
						{
							fileContent = editInfo + "\n" + fileContent;
						}
						trace("转换bin文件：" + file);
						__$writeFile(file, fileContent);
					}
				}
			}
			trace("开始导入库, 耐心等待...");
			require("child_process").execSync("npm link", {cwd: __libPath});

			if (__projPath != "")
			{
				updateFile();
			}

			process.exit();
		});
	});
}

function updateFile()
{
	var fileList = fs.readFileSync(path.join(__dirname, "./cli-template/fileList")).toString();
	var fileList = __$readLibFile("./bin/cli-template/fileList");
	fileList = fileList.replace(/\r\n/g, "\n");
	fileList = fileList.replace(/\r/g, "");
	fileList = fileList.replace(/\n/g, ",");
	fileList = fileList.split(",");

	for (var i = 0; i < fileList.length; i++)
	{
		var targetFilePath = __$projPath(fileList[i]);
		var pathObj = g.path.parse(targetFilePath);
		var targetDir = pathObj.dir;
		if (pathObj.ext == "")
		{
			targetDir += "\\" + pathObj.base;
		}
		if (!__$projExist(targetDir))
		{
			g.file.createDirectory(targetDir);
		}

		__$copy_lib2proj(fileList[i], fileList[i]);
		trace("Copy File: " + __$projPath(fileList[i]));
	}
}

function open()
{
	opener(__libPath, function ()
	{
		process.exit();
	});
}

function start($routerName)
{
	self.checkInit();
	require("./server")($routerName);
}

function run(...arg)
{
	var cmd = arg[0];
	if (cmd && typeof cmd == "object" && cmd.exe && typeof cmd.exe == "function")
	{
		if (!cmd.exe.apply(cmd.exe, arg))
		{
		}
		else
		{
			return;
		}
	}

	var runFunc = require("./run");
	if (arg.length > 0)
	{
		runFunc.apply(runFunc, arg);
	}
	else
	{
		__$exit();
	}
}

function addRouter($routerName, $serverType)
{
	if ($routerName)
	{
		if ($routerName.indexOf(".json") > 0)
		{
			$routerName = $routerName.replace(".json", "");
		}

		var routerList = g.file.getDirectoryListing(__$projPath("./router"));
		routerList = routerList.map(function (v)
		{
			return g.file.getFileName(v);
		});

		if (routerList.indexOf($routerName) < 0)
		{
			globalCmd.log("Add Router:", $routerName);
			__$copy_lib2proj("./bin/cli-template/router.json", "./router/" + $routerName + ".json");
			trace("Create File:" + __$projPath("./router/" + $routerName + ".json"));
			globalCmd.log("Router File Created.");
		}
		else
		{
			log._info("已经存在router文件: " + $routerName);
		}

		if ($serverType)
		{
			addServer($routerName, $serverType);
		}
		else
		{
			process.exit();
		}
	}
	else
	{
		log.error("请指定1个router文件名称");
		process.exit();
	}
}

function addServer($routerName, $serverType)
{
	if ($serverType == undefined)
	{
		$serverType = $routerName;
		$routerName = null;
	}

	if (!$routerName)
	{
		var routerList = g.file.getDirectoryListing(__$projPath("./router"));
		routerList = routerList.map(function (v)
		{
			return g.file.getFileName(v);
		});

		if (routerList.length == 1)
		{
			toAdd(routerList[0], $serverType);
		}
		else if (routerList.length > 1)
		{
			var routerFileList = g.file.getDirectoryListing(__$projPath("./router"));
			self.showSelectList(routerFileList, function ($select)
			{
				var routerName = g.file.getFileName($select.value);
				toAdd(routerName, $serverType);
			});
		}
		else
		{
			log.error("没有找到router文件!");
			log.info("使用该命令创建router文件: nodecli add {router}");
			process.exit();
		}
	}
	else
	{
		toAdd($routerName, $serverType);
	}

	function toAdd(routerName, serverType)
	{
		if (routerName.indexOf(".json") < 0)
		{
			routerName += ".json";
		}
		routerName = g.file.getFileName(routerName);

		routerName = "./router/" + routerName + ".json";
		if (__$projExist(routerName))
		{
			var routerTemplatePath = __$libPath("./bin/cli-template/router");
			var serverFileList = g.file.getDirectoryListing(routerTemplatePath);
			var serverTypeList = serverFileList.map(function (v)
			{
				return g.file.getFileName(v)
			});

			if (serverType && serverTypeList.indexOf(serverType) >= 0)
			{
				toCreate(routerName, serverType);
			}
			else
			{
				self.showSelectList(serverTypeList, function ($select)
				{
					toCreate(routerName, $select.value);
				})
			}
		}
		else
		{
			log.error("没有找到router文件!");
			process.exit();
		}
	}

	function toCreate(routerName, serverType)
	{
		var routerObj = require(__$projPath(routerName));
		var serverObj = require("./cli-template/router/" + serverType + ".json");
		routerObj.info.push(serverObj);
		__$writeFile(routerName, JSON.stringify(routerObj, null, 2));
		globalCmd.log("Server Type Added: " + serverType);

		var testFilePath = __$libPath("./bin/cli-template/test.js");
		if (!__$projExist("./module/template.js"))
		{
			__$copy_lib2proj("./bin/cli-template/test.js", "./module/template.js");
			trace("Create File:" + __$projPath("./module/template.js"));
		}
		process.exit();
	}
}

function addModule($moduleName)
{
	if ($moduleName)
	{
		$moduleName = $moduleName.replace(/ /g, "");
	}

	if (!$moduleName)
	{
		self.showMsg("please input a name for module file：", function ($input)
		{
			$moduleName = $input;
			checkName();
		});
	}
	else
	{
		checkName();
	}

	function checkName()
	{
		if (!$moduleName)
		{
			process.exit();
		}

		if ($moduleName.indexOf(".js") < 0)
		{
			$moduleName += ".js";
		}

		if (__$projExist("./module/" + $moduleName))
		{
			log.warn("Module is Existd: " + __$projPath("./module/" + $moduleName));
			process.exit();
		}

		addModuleByName();
	}

	function addModuleByName()
	{
		__$copy_lib2proj("./bin/cli-template/module-template.js", "./module/" + $moduleName);
		trace("Create File:" + __$projPath("./module/" + $moduleName));
		process.exit();
	}
}

function addTest($testDir)
{
	if ($testDir)
	{
		$testDir = $testDir.replace(/ /g, "");
	}

	if (!$testDir)
	{
		self.showMsg("please input a name for test directory：", function ($input)
		{
			$testDir = $input;
			checkName();
		});
	}
	else
	{
		checkName();
	}

	function checkName()
	{
		if (!$testDir)
		{
			process.exit();
		}

		if (__$projExist("./module/" + $testDir))
		{
			log.warn("Module is Existd: " + __$projPath("./module/" + $testDir));
			process.exit();
		}

		addTestByName();
	}

	function addTestByName()
	{
		__$copy_lib2proj("./bin/cli-template/test-template", "./module/" + $testDir);
		trace("Create Directory:" + __$projPath("./module/" + $testDir));
		process.exit();
	}
}

function addBin($binName)
{
	if ($binName)
	{
		$binName = $binName.replace(/ /g, "");
	}

	if (!$binName)
	{
		self.showMsg("please input a name for bin file：", function ($input)
		{
			$binName = $input;
			checkName();
		});
	}
	else
	{
		checkName();
	}

	function checkName()
	{
		if (!$binName)
		{
			process.exit();
		}
		addBinByName();
	}

	function addBinByName()
	{
		var packageObj = require(__$projPath("./package.json"));

		if (!packageObj.bin)
		{
			packageObj.bin = {};
		}
		if (!packageObj.bin[$binName])
		{
			packageObj.bin[$binName] = "./bin/" + $binName + ".js";

			if (!__$projExist("./bin/"))
			{
				g.file.createDirectory(__$projPath("./bin/"));
			}

			__$copy_lib2proj("./bin/cli-template/bin-template.js", "./bin/" + $binName + ".js");
			__$writeFile("./package.json", JSON.stringify(packageObj, null, "\t"));
			trace("Create File: " + __$projPath("./bin/" + $binName + ".js"));
			process.exit();
		}
		else
		{
			log.warn("已经存在 " + $binName + " : " + packageObj.bin[$binName]);
			process.exit();
		}
	}
}