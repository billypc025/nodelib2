/**
 * Created by billy on 2017/5/13.
 */
var g = require("./global");
var inquirer;

var serverManager = require("./manager/ServerManager");
var options = {router: ""};

var arg = getArgs();

if (arg.length == 0)
{
	if (g.file.exists("./router"))
	{
		showRouterList("./router");
	}
	else
	{
		log.error("找到router目录或文件！");
		process.exit(0);
	}
}
else
{
	if (g.file.exists(arg[0]))
	{
		if (g.file.isFile(arg[0]))
		{
			options.router = arg[0];
			start();
		}
		else
		{
			showRouterList(arg[0]);
		}
	}
	else
	{
		log.error(" 指定的router目录或文件不存在！");
		log.error(" 找不到目录或文件 \"" + routerPath + "\"");
		process.exit(0);
	}
}

function showRouterList($basePath)
{
	var inquirer = require('inquirer');
	var selectOption = {
		type: "list",
		name: "router",
		message: "Select router to start Server!",
		choices: []
	};

	var fileList = g.file.getDirectoryListing(g.path.resolve($basePath));
	selectOption.choices = fileList.concat();

	inquirer.prompt(selectOption).then(function ($answer)
	{
		__merge(options, $answer, true);
		process.argv.push(options.router);
		start();
	});
}

function start()
{
	serverManager.start(options);
}