var path = require("path");
var file = require("fs");
var cp_exec = require('child_process').exec;

function getGlobalJava()
{
	var JAVA_EXT = process.platform == 'win32' ? '.exe' : '';

	var java = path.join(process.execPath, "../jre/bin", "java" + JAVA_EXT);
	if (!file.exists(java))
	{
		java = null;
		if (process.env["JAVA_HOME"])
		{
			if (process.env["JAVA_HOME"].indexOf("bin") > 0)
			{
				java = path.join(process.env["JAVA_HOME"], "java" + JAVA_EXT);
			}
			else
			{
				java = path.join(process.env["JAVA_HOME"], "bin", "java" + JAVA_EXT);
			}
			if (!file.existsSync(java))
			{
				java = null;
			}
		}
	}
	if (!java)
	{
		java = "java";
	}
	else
	{
		java = '"' + java + '"';
	}
	return java;
}

function addQuotes(str)
{
	return "\"" + str + "\"";
}

function createZipFile(sourcePath, outputFile, call, password)
{
	var compilerPath = path.join(__dirname, "EGTZipTool_v1.0.2.jar");
	compilerPath = addQuotes(compilerPath);
	outputFile = addQuotes(outputFile);
	sourcePath = addQuotes(sourcePath);

	var cmd = getGlobalJava() + ' -jar ' + compilerPath + ' zip ' + outputFile + ' ' + sourcePath + ' ' + (password || "");
	var build = cp_exec(cmd);
//        build.stdout.on("data", function(data) {
//            globals.log(data);
//        });
	build.stderr.on("data", function (data)
	{
		console.log(data);
	});
	build.on("exit", function (result)
	{
		if (result == 0)
		{
			//结束
			call && call();
		}
		else
		{
			//todo zip异常
			//globals.warn(result);
			console.error("打zip包出现异常！");
		}
	});
}

exports.create = createZipFile;