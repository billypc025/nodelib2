/**
 * Created by billy on 2017/5/13.
 */
var g = require("../global");
var Manager = require("./Manager");
var _testCore = require("./test/core");
var _sqlCore = require("./test/sqlCore");
var _timeTool = require("../utils/TimeTool");
var _log = "";
var _errorLog = "";

module.exports = class extends Manager {

	init()
	{
		this.managerType = "Test";
		this.list = [];
		this.step = 0;
		_sqlCore.init();
		super.init();
	}

	initModule()
	{
		for (var routerPath in this.module)
		{
			var modulePath = this.module[routerPath];
			modulePath = __projpath(modulePath);

			this.addModule(routerPath + 1, modulePath);
		}
		this.start();
	}

	addModule($name, $path)
	{
		$name += "";
		if (g.file.isDirectory($path))
		{
			if (!g.file.exists($path))
			{
				return;
			}

			var fileList = g.file.getDirectoryAllListing($path);
			for (var i = 0; i < fileList.lengthl; i++)
			{
				var filePath = fileList[i];
				if (g.file.getExtension(filePath) != "js")
				{
					fileList.splice(i, 1);
					i--;
				}
			}

			fileList.sort(function (a, b)
			{
				var a0 = a.substr(0, a.indexOf(".")) - 0;
				var b0 = a.substr(0, b.indexOf(".")) - 0;
				if (isNaN(a0) && isNaN(b0))
				{
					return compareString(a, b);
				}
				else
				{
					if (!isNaN(a0) && !isNaN(b0))
					{
						return a0 - b0;
					}
					else
					{
						return isNaN(a0) ? 1 : -1;
					}
				}
			})
			this.list.push([$name, fileList]);
		}
		else
		{
			if ($path.indexOf(".js") != $path.length - 3)
			{
				$path += ".js";
			}

			if (!g.file.isFile($path)) //不是文件就返回
			{
				return;
			}

			if (g.file.getExtension($path) != "js")
			{
				return;
			}

			this.list.push([$name, $path]);
		}
	}

	start()
	{
		super.start();
		this.initTest();

		global.emiter.addListener("ALL_INITED", ()=>
		{
			this.startDataInit();
		});
	}

	initTest()
	{
		_testCore.init(this.data.param);
		_testCore.on("COMPLETE", ($log)=>
		{
			_log += "[Module] - " + this.list[this.step][0] + "\r\n";
			_log += $log;
			this.step++;
			this.startTest();
		})
		log.info("[Test] " + this.name);
	}

	startDataInit()
	{
		this.startTest();
	}

	startTest()
	{
		if (this.step >= this.list.length)
		{
			log.success("--------------------------- All Test Done! ---------------------------");

			var time = _timeTool.getFullDate();
			time = time.replace(/:/g, ".");
			g.fs.writeFileSync(__projpath("./log/" + time + ".txt"), _log);
			process.exit();
		}
		else
		{
			var name = this.list[this.step][0];
			log.info("[Test] - " + name);
			var filePath = this.list[this.step][1];
			if (typeof filePath == "string")
			{
				log._info(g.file.getRelativePath(__projdir, filePath));
				require(filePath);
			}
			else if (Array.isArray(filePath))
			{
				for (var i = 0; i < filePath.length; i++)
				{
					log._info(g.file.getRelativePath(__projdir, filePath[i]));
					trace(filePath[i])
					require(filePath[i]);
				}
			}
			_testCore.startTest();
		}
	}
}
