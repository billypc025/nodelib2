/**
 * Created by billy on 2016/12/21.
 */
var FS = require("fs");
var Path = require("path");
var charset = "utf-8";
/**
 * 保存数据到指定文件
 * @param path 文件完整路径名
 * @param data 要保存的数据
 */
function save(path, data)
{
	if (exists(path))
	{
		remove(path);
	}
	path = escapePath(path);
	textTemp[path] = data;
	createDirectory(Path.dirname(path));
	FS.writeFileSync(path, data, charset);
}
exports.save = save;
/**
 * 创建文件夹
 */
function createDirectory(path, mode, made)
{
	path = escapePath(path);
	if (mode === undefined)
	{
		mode = 511 & (~process.umask());
	}
	if (!made)
	{
		made = null;
	}
	if (typeof mode === 'string')
	{
		mode = parseInt(mode, 8);
	}
	path = Path.resolve(path);
	try
	{
		FS.mkdirSync(path, mode);
		made = made || path;
	}
	catch (err0)
	{
		switch (err0.code)
		{
			case 'ENOENT':
				made = createDirectory(Path.dirname(path), mode, made);
				createDirectory(path, mode, made);
				break;
			default:
				var stat;
				try
				{
					stat = FS.statSync(path);
				}
				catch (err1)
				{
					throw err0;
				}
				if (!stat.isDirectory())
				{
					throw err0;
				}
				break;
		}
	}
	return made;
}
exports.createDirectory = createDirectory;
var textTemp = {};
/**
 * 读取文本文件,返回打开文本的字符串内容，若失败，返回"".
 * @param path 要打开的文件路径
 */
function read(path, ignoreCache)
{
	if (ignoreCache === void 0)
	{
		ignoreCache = false;
	}
	path = escapePath(path);
	var text = textTemp[path];
	if (text && !ignoreCache)
	{
		return text;
	}
	try
	{
		text = FS.readFileSync(path, charset);
		text = text.replace(/^\uFEFF/, '');
	}
	catch (err0)
	{
		return "";
	}
	if (text)
	{
		var ext = getExtension(path).toLowerCase();
		if (ext == "ts" || ext == "exml")
		{
			textTemp[path] = text;
		}
	}
	return text;
}
exports.read = read;
/**
 * 读取字节流文件,返回字节流，若失败，返回null.
 * @param path 要打开的文件路径
 */
function readBinary(path)
{
	path = escapePath(path);
	try
	{
		var binary = FS.readFileSync(path);
	}
	catch (e)
	{
		return null;
	}
	return binary;
}
exports.readBinary = readBinary;
/**
 * 复制文件或目录
 * @param source 文件源路径
 * @param dest 文件要复制到的目标路径
 */
function copy(source, dest)
{
	source = escapePath(source);
	dest = escapePath(dest);
	var stat = FS.lstatSync(source);
	if (stat.isDirectory())
	{
		_copy_dir(source, dest);
	}
	else
	{
		_copy_file(source, dest);
	}
}
exports.copy = copy;
function isDirectory(path)
{
	path = escapePath(path);
	try
	{
		var stat = FS.statSync(path);
	}
	catch (e)
	{
		return false;
	}
	return stat.isDirectory();
}
exports.isDirectory = isDirectory;
function isSymbolicLink(path)
{
	path = escapePath(path);
	try
	{
		var stat = FS.statSync(path);
	}
	catch (e)
	{
		return false;
	}
	return stat.isSymbolicLink();
}
exports.isSymbolicLink = isSymbolicLink;
function isFile(path)
{
	path = escapePath(path);
	try
	{
		var stat = FS.statSync(path);
	}
	catch (e)
	{
		return false;
	}
	return stat.isFile();
}
exports.isFile = isFile;
function _copy_file(source_file, output_file)
{
	if (isDirectory(output_file))
	{
		var fileName = getFileName(source_file);
		var extName = getExtension(source_file);
		if (extName)
		{
			fileName += "." + extName;
		}
		output_file = Path.join(output_file, fileName);
	}
	createDirectory(Path.dirname(output_file));
	var byteArray = FS.readFileSync(source_file);
	FS.writeFileSync(output_file, byteArray);
}
function _copy_dir(sourceDir, outputDir)
{
	createDirectory(outputDir);
	var list = FS.readdirSync(sourceDir);
	list.forEach(function (fileName)
	{
		copy(Path.join(sourceDir, fileName), Path.join(outputDir, fileName));
	});
}
/**
 * 删除文件或目录
 * @param path 要删除的文件源路径
 */
function remove(path)
{
	path = escapePath(path);
	try
	{
		FS.lstatSync(path).isDirectory()
			? rmdir(path)
			: FS.unlinkSync(path);
		getDirectoryListing(path);
	}
	catch (e)
	{
	}
}
exports.remove = remove;
function rmdir(path)
{
	var files = [];
	if (FS.existsSync(path))
	{
		files = FS.readdirSync(path);
		files.forEach(function (file)
		{
			var curPath = path + "/" + file;
			if (FS.statSync(curPath).isDirectory())
			{
				rmdir(curPath);
			}
			else
			{
				FS.unlinkSync(curPath);
			}
		});
		FS.rmdirSync(path);
	}
}
function rename(oldPath, newPath)
{
	if (isDirectory(oldPath))
	{
		FS.renameSync(oldPath, newPath);
	}
}
exports.rename = rename;
/**
 * 返回指定文件的父级文件夹路径,返回字符串的结尾已包含分隔符。
 */
function getDirectory(path)
{
	path = escapePath(path);
	return Path.dirname(path) + "/";
}
exports.getDirectory = getDirectory;
/**
 * 获得路径的扩展名,不包含点字符。
 */
function getExtension(path)
{
	path = escapePath(path);
	var index = path.lastIndexOf(".");
	if (index == -1)
	{
		return "";
	}
	var i = path.lastIndexOf("/");
	if (i > index)
	{
		return "";
	}
	return path.substring(index + 1);
}
exports.getExtension = getExtension;
/**
 * 获取路径的文件名(不含扩展名)或文件夹名
 */
function getFileName(path)
{
	if (!path)
	{
		return "";
	}
	path = escapePath(path);
	var startIndex = path.lastIndexOf("/");
	var endIndex;
	if (startIndex > 0 && startIndex == path.length - 1)
	{
		path = path.substring(0, path.length - 1);
		startIndex = path.lastIndexOf("/");
		endIndex = path.length;
		return path.substring(startIndex + 1, endIndex);
	}
	endIndex = path.lastIndexOf(".");
	if (endIndex == -1 || isDirectory(path))
	{
		endIndex = path.length;
	}
	return path.substring(startIndex + 1, endIndex);
}
exports.getFileName = getFileName;
/**
 * 获取指定文件夹下的文件或文件夹列表，不包含子文件夹内的文件。
 * @param path 要搜索的文件夹
 * @param relative 是否返回相对路径，若不传入或传入false，都返回绝对路径。
 */
function getDirectoryListing(path, relative = false, options = {})
{
	if (relative === void 0)
	{
		relative = false;
	}
	path = escapePath(path);
	try
	{
		var list = FS.readdirSync(path);
	}
	catch (e)
	{
		return [];
	}
	var length = list.length;
	if (!relative)
	{
		for (var i = length - 1; i >= 0; i--)
		{
			if (list[i].charAt(0) == "." && options.all !== true)
			{
				list.splice(i, 1);
			}
			else
			{
				list[i] = joinPath(path, list[i]);
			}
		}
	}
	else
	{
		for (i = length - 1; i >= 0; i--)
		{
			if (list[i].charAt(0) == ".")
			{
				list.splice(i, 1);
			}
		}
	}
	return list;
}
exports.getDirectoryListing = getDirectoryListing;
/**
 * 获取指定文件夹下全部的文件列表，包括子文件夹
 * @param path
 * @returns {any}
 */
function getDirectoryAllListing(path, options = {})
{
	var list = [];
	if (isDirectory(path))
	{
		var fileList = getDirectoryListing(path, !!options.relative, options);
		for (var file of fileList)
		{
			list = list.concat(getDirectoryAllListing(file, options));
		}
		return list;
	}
	return [path];
}
exports.getDirectoryAllListing = getDirectoryAllListing;
/**
 * 使用指定扩展名搜索文件夹及其子文件夹下所有的文件
 * @param dir 要搜索的文件夹
 * @param extension 要搜索的文件扩展名,不包含点字符，例如："png"。不设置表示获取所有类型文件。
 */
function search(dir, extension)
{
	var list = [];
	try
	{
		var stat = FS.statSync(dir);
	}
	catch (e)
	{
		return list;
	}
	if (stat.isDirectory())
	{
		findFiles(dir, list, extension, null);
	}
	return list;
}
exports.search = search;
/**
 * 使用过滤函数搜索文件夹及其子文件夹下所有的文件
 * @param dir 要搜索的文件夹
 * @param filterFunc 过滤函数：filterFunc(file:File):Boolean,参数为遍历过程中的每一个文件，返回true则加入结果列表
 */
function searchByFunction(dir, filterFunc, checkDir)
{
	var list = [];
	try
	{
		var stat = FS.statSync(dir);
	}
	catch (e)
	{
		return list;
	}
	if (stat.isDirectory())
	{
		findFiles(dir, list, "", filterFunc, checkDir);
	}
	return list;
}
exports.searchByFunction = searchByFunction;
function findFiles(filePath, list, extension, filterFunc, checkDir)
{
	var files = FS.readdirSync(filePath);
	var length = files.length;
	for (var i = 0; i < length; i++)
	{
		if (files[i].charAt(0) == ".")
		{
			continue;
		}
		var path = joinPath(filePath, files[i]);
		var stat = FS.statSync(path);
		if (stat.isDirectory())
		{
			if (checkDir)
			{
				if (!filterFunc(path))
				{
					continue;
				}
			}
			findFiles(path, list, extension, filterFunc);
		}
		else if (filterFunc != null)
		{
			if (filterFunc(path))
			{
				list.push(path);
			}
		}
		else if (extension)
		{
			var len = extension.length;
			if (path.charAt(path.length - len - 1) == "." &&
				path.substr(path.length - len, len).toLowerCase() == extension)
			{
				list.push(path);
			}
		}
		else
		{
			list.push(path);
		}
	}
}
/**
 * 指定路径的文件或文件夹是否存在
 */
function exists(path)
{
	path = escapePath(path);
	return FS.existsSync(path);
}
exports.exists = exists;
/**
 * 转换本机路径为Unix风格路径。
 */
function escapePath(path)
{
	if (!path)
	{
		return "";
	}
	return path.split("\\").join("/");
}
exports.escapePath = escapePath;
/**
 * 连接路径,支持传入多于两个的参数。也支持"../"相对路径解析。返回的分隔符为Unix风格。
 */
function joinPath(dir)
{
	var filename = [];
	for (var _i = 1; _i < arguments.length; _i++)
	{
		filename[_i - 1] = arguments[_i];
	}
	var path = Path.join.apply(null, arguments);
	path = escapePath(path);
	return path;
}
exports.joinPath = joinPath;
function getRelativePath(dir, filename)
{
	var relative = Path.relative(dir, filename);
	return escapePath(relative);
}
exports.getRelativePath = getRelativePath;
function basename(p, ext)
{
	var path = Path.basename.apply(null, arguments);
	path = escapePath(path);
	return path;
}
exports.basename = basename;
//获取相对路径 to相对于from的路径
function relative(from, to)
{
	var path = Path.relative.apply(null, arguments);
	path = escapePath(path);
	return path;
}
exports.relative = relative;
/**
 * 检查文件是否为UTF8格式
 */
function isUTF8(text)
{
	var i = 0;
	while (i < text.length)
	{
		if ((// ASCII
				text[i] == 0x09 ||
				text[i] == 0x0A ||
				text[i] == 0x0D ||
				(0x20 <= text[i] && text[i] <= 0x7E)
			)
		)
		{
			i += 1;
			continue;
		}

		if ((// non-overlong 2-byte
				(0xC2 <= text[i] && text[i] <= 0xDF) &&
				(0x80 <= text[i + 1] && text[i + 1] <= 0xBF)
			)
		)
		{
			i += 2;
			continue;
		}

		if ((// excluding overlongs
				text[i] == 0xE0 &&
				(0xA0 <= text[i + 1] && text[i + 1] <= 0xBF) &&
				(0x80 <= text[i + 2] && text[i + 2] <= 0xBF)
			) ||
			(// straight 3-byte
				((0xE1 <= text[i] && text[i] <= 0xEC) ||
				text[i] == 0xEE ||
				text[i] == 0xEF) &&
				(0x80 <= text[i + 1] && text[i + 1] <= 0xBF) &&
				(0x80 <= text[i + 2] && text[i + 2] <= 0xBF)
			) ||
			(// excluding surrogates
				text[i] == 0xED &&
				(0x80 <= text[i + 1] && text[i + 1] <= 0x9F) &&
				(0x80 <= text[i + 2] && text[i + 2] <= 0xBF)
			)
		)
		{
			i += 3;
			continue;
		}

		if ((// planes 1-3
				text[i] == 0xF0 &&
				(0x90 <= text[i + 1] && text[i + 1] <= 0xBF) &&
				(0x80 <= text[i + 2] && text[i + 2] <= 0xBF) &&
				(0x80 <= text[i + 3] && text[i + 3] <= 0xBF)
			) ||
			(// planes 4-15
				(0xF1 <= text[i] && text[i] <= 0xF3) &&
				(0x80 <= text[i + 1] && text[i + 1] <= 0xBF) &&
				(0x80 <= text[i + 2] && text[i + 2] <= 0xBF) &&
				(0x80 <= text[i + 3] && text[i + 3] <= 0xBF)
			) ||
			(// plane 16
				text[i] == 0xF4 &&
				(0x80 <= text[i + 1] && text[i + 1] <= 0x8F) &&
				(0x80 <= text[i + 2] && text[i + 2] <= 0xBF) &&
				(0x80 <= text[i + 3] && text[i + 3] <= 0xBF)
			)
		)
		{
			i += 4;
			continue;
		}

		return false;
	}

	return true;
}
exports.isUTF8 = isUTF8;

