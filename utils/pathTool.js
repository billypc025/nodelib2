/**
 * Created by billy on 2020/1/17.
 */
var g = require("../global");
var path = require("path");
var fs = require("fs");

exports.init = function ($scope)
{
	var libPath = path.join(__dirname, "../");
	var currPath = path.resolve("./");
	var projPath = currPath;

	while (currPath != g.file.getDirectory(currPath))
	{
		var tempPath = path.join(currPath, "package.json");
		if (fs.existsSync(tempPath))
		{
			if (require(tempPath).proj == "nodecli")
			{
				projPath = path.join(g.file.getDirectory(tempPath), "");
			}
			break;
		}
		currPath = g.file.getDirectory(currPath);
	}

	global.__libPath = libPath;   //nodeLib库路径
	global.__$libPath = function ($path = "")  //以nodeLib库目录为根节点，获取绝对路径
	{
		if ($path.indexOf(libPath) < 0)
		{
			return path.join(libPath, $path);
		}
		return $path;
	}
	global.__projPath = projPath; //项目目录路径
	global.__$projPath = function ($path = "")
	{
		if ($path.indexOf(projPath) < 0)
		{
			return path.join(projPath, $path);
		}
		return $path;
	}

	global.__$projExist = function ($path)
	{
		return fs.existsSync(__$projPath($path));
	}

	global.__$copy = function ($sourcePath, $targetPath)
	{
		if (!fs.existsSync($sourcePath))
		{
			return;
		}

		if (g.file.isDirectory($sourcePath))
		{
			var list = g.file.getDirectoryListing($sourcePath);
			for (var i = 0; i < list.length; i++)
			{
				var temppath = g.path.resolve(list[i]).replace($sourcePath, "");
				__$copy_lib2proj($sourcePath + temppath, $targetPath + temppath);
			}
		}
		else
		{
			cp('-Rf', $sourcePath, $targetPath);
		}
	}

	global.__$copy_lib2proj = function ($libPath, $projPath)
	{
		var sourcePath = __$libPath($libPath);
		var targetPath = __$projPath($projPath);
		__$copy(sourcePath, targetPath);
	}

	global.__$writeFile = function ($path, $data)
	{
		g.fs.writeFileSync(__$projPath($path), $data);
	}

	global.__$readLibFile = function ($path)
	{
		return fs.readFileSync(__$libPath($path)).toString();
	}

	global.__$readProjFile = function ($path)
	{
		return fs.readFileSync(__$projPath($path)).toString();
	}
	global.__$exit = function ($code)
	{
		process.exit($code);
	}
}