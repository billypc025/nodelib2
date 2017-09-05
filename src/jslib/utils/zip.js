/**
 * Created by billy on 2017/8/21.
 */
var path = require("path");
var fs = require("./FileUtil");
var zip = require("./createzip");

module.exports = function ($sourcePath, $outputFile, $password, $callBack)
{
	if ($sourcePath == undefined)
	{
		$callBack && $callBack({
			status: 1,
			msg: "需要指定一个待压缩的目标文件或文件夹！"
		});
	}

	$password = $password || "";

	var fileDirName = "";

	$sourcePath = path.resolve($sourcePath);
	if (!fs.exists(path.resolve($sourcePath)))
	{
		$callBack && $callBack({
			status: 2,
			msg: "待压缩的目标文件或文件夹不存在！"
		});
	}

	var basePath = fs.getDirectory($sourcePath);

	if (fs.isFile($sourcePath))
	{
		fileDirName = new Date().getTime() + "";
		fileDirName = path.join(basePath, fileDirName);
		fs.createDirectory(fileDirName);
		fs.copy($sourcePath, fileDirName);

	}

	if (!$outputFile)
	{
		$outputFile = path.join(basePath, fs.getFileName($sourcePath));
	}
//	else if (outputFile.indexOf("$") >= 0)
//	{
//		outputFile = outputFile.replace("$", basePath + fs.getFileName(sourcePath))
//	}

	if ($outputFile.indexOf(".zip") < 0)
	{
		$outputFile += ".zip";
	}

	if (fileDirName)
	{
		$sourcePath = fileDirName;
	}

	zip.create($sourcePath, $outputFile, function ()
	{
		if (fileDirName)
		{
			fs.remove(fileDirName);
		}
		$callBack && $callBack({
			status: 0,
			msg: ""
		});
	}, $password);
}