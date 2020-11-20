#!/usr/bin/env node
/**
 * Created by billy on 2020/11/20.
 */
require('shelljs/global');
require("../global");
var images = require("images");
var argv = getArgs();
//dir
//-q quality
//-s
var __allChild = false;
var __targetPath = "";
var __quality = 50;
if (argv.indexOf("-q") >= 0)
{
	var qIndex = argv.indexOf("-q");
	__quality = parseInt(argv[qIndex + 1]);
	__quality = Math.max(1, __quality);
	__quality = Math.min(100, __quality);
	argv.splice(qIndex, 1);
	argv.splice(qIndex, 1);
}

if (argv.indexOf("-s") >= 0)
{
	var childIndex = argv.indexOf("-s");
	__allChild = true;
	argv.splice(childIndex, 1);
}

if (argv.length > 0)
{
	__targetPath = argv[0];
}

var _sourcePath = g.path.resolve(g.path.join("./", __targetPath));
var _pathList;
if (__allChild)
{
	_pathList = g.file.getDirectoryAllListing(_sourcePath, {all: true});
}
else
{
	_pathList = g.file.getDirectoryListing(_sourcePath, false, {all: true});
}

var _supportExtList = [".jpg", ".jpeg", ".png"];
var _fileHash = {};
var _fileList = [];
_pathList.forEach(v=>
{
//	{ root: '/',
//		dir: '/Users/billy/work/duoji/html-analy/chief-exp',
//		base: 'index.html',
//		ext: '.html',
//		name: 'index' }

	var pathObj = g.path.parse(v);
	if (_supportExtList.indexOf(pathObj.ext) >= 0)
	{
		updatePool(v, pathObj);
//		cp(v, `${pathObj.dir}/.origin-${pathObj.base}`);
	}
})

_fileList.forEach(v=>
{
	var fileObj = _fileHash[v];
	if (!fileObj.hasOrigin)
	{
		cp(fileObj.target, fileObj.origin);
	}
	images(fileObj.origin).save(fileObj.target, {quality: __quality});

	var statObj_origin = g.fs.statSync(fileObj.origin);
	var statObj_target = g.fs.statSync(fileObj.target);
	var msg;
	if (statObj_target.size >= statObj_origin.size)
	{
		cp(fileObj.origin, fileObj.target);
		log._info(`【No Change】${fileObj.target}`);
	}
	else
	{
		log.success(`【Output: ${size(statObj_origin.size)}=>${size(statObj_target.size)}】${fileObj.target}`);
	}
})
exit();

function updatePool($path, $pathObj)
{
	var originFile = "";
	var targetFile = "";
	var hasOrigin = false;
//	trace($pathObj.base)
	if ($pathObj.base.indexOf(".origin-") == 0)
	{
		originFile = $path;
		targetFile = `${$pathObj.dir}/${$pathObj.base.replace(".origin-", "")}`;
		hasOrigin = true;
		if (_fileHash[targetFile])
		{
			_fileHash[targetFile].hasOrigin = true;
		}
	}
	else
	{
		originFile = `${$pathObj.dir}/.origin-${$pathObj.base}`;
		targetFile = $path;
	}
	if (!_fileHash[targetFile])
	{
		_fileHash[targetFile] = {
			origin: originFile,
			target: targetFile,
			ext: $pathObj.ext,
			hasOrigin,
		}
		_fileList.push(targetFile);
	}
}

function size($size)
{
	if ($size > 1048576)
	{
		return ($size / 1048576).toFixed(2) + " MB";
	}
	if ($size > 1024)
	{
		return Math.ceil($size / 1024) + " KB";
	}
	return $size + " B";
}