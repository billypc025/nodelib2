/**
 * Created by billy on 2017/2/20.
 */
/**
 * 判断对象是否是数组
 * @param d 传入的对象
 * @returns {boolean}
 */
function isArray(d)
{
	return Array.isArray(d);
}
global.isArray = isArray;

/**
 * 在范围中抽取随机数
 * @param a 区间下限(上限) / arr 目标数区间
 * @param b 区间上限(下限) / floor （默认true） true:向下取整  false:不取整
 * @param floor （默认true） true:向下取整  false:不取整
 *
 */
function random(a, b, floor)
{
	var x, y, f;
	if (isArray(a))
	{
		x = a[0];
		y = a[1];
		if (b !== null && b !== undefined)
		{
			f = b;
		}
		else
		{
			f = true;
		}
		;
	}
	else
	{
		x = a;
		y = b;
		if (floor !== null && floor !== undefined)
		{
			f = floor;
		}
		else
		{
			f = true;
		}
		;
	}
	if (x == y)
	{
		return x;
	}
	;
	x = Math.random() * (Math.max(x, y) - Math.min(x, y)) + Math.min(x, y);
	if (f)
	{
		x = Math.floor(x);
	}
	;

	return x;
}
global.random = random;

/**
 * 在一组数中抽取任意一个（可传n个的数）
 *
 */
function random2Num()
{
	if (arguments.length > 1)
	{
		return arguments[int(Math.random() * arg.length)];
	}
	else if (isArray(arg[0]))
	{
		return arguments[0][int(Math.random() * arg[0].length)];
	}
	else
	{
		return arg[0];
	}
}
global.random2Num = random2Num;

/**
 * 取整
 * @param v 源数字
 * @returns {number}
 */
function int(v)
{
	return Math.floor(v);
}
global.int = int;

/**
 * 打印日志
 */
function trace()
{
	var arr = [];
	for (var i = 0; i < arguments.length; i++)
	{
		arr.push(arguments[i]);
	}
	console.log.apply(console, arr);
}
global.trace = trace;

/**
 * 格式化字符串，支持以下格式
 * 1)  xxxxx{0}xxx{1}xxxx{2}xxxxx
 * 2)  xxxxx{name}xxxxx{age}xxxxx
 * 【范例】
 * 范例1> var str="xxxxx{0}xxx{1}xxxx{2}xxxxx";
 *       paramFormat(str,1,2,3)
 * 范例2> var str="xxxxx{name}xxx{age}xxxx{sex}xxxxx";
 *       paramFormat(str,{name:"billy", age:34, sex:"男"});
 * 范例3> var str="xxxxx{0}xxx{1}xxxx{2}xxxxx";
 *       paramFormat(str,[1,2,3]);
 * @param str 原始字符串
 * @return string 返回目标字符串
 */
function paramFormat(str, paramObj)
{
	var g;
	var list;
	str = str.toString();
	if (typeof paramObj == "object")
	{
		list = paramObj;
	}
	else
	{
		list = arguments;
	}
	for (var i in list)
	{
		if (list.hasOwnProperty(i))
		{
			g = new RegExp("\\{" + i + "\\}", "g");
			str = str.replace(g, list[i]);
		}
	}
	return str;
}
global.paramFormat = paramFormat;

/**
 * 判断源字符串是否是数字，或者能转成数字
 * @param p_string 源
 * @returns {boolean}
 */
function isNum(p_string)
{
	if (typeof p_string == "number")
	{
		return true;
	}
	else if (typeof p_string == "string")
	{
		if (p_string == "")
		{
			return false;
		}

		var regx = /^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?$/;
		return regx.test(p_string);
	}

	return false;
}
global.isNum = isNum;

/**
 * 去除字符串两端的空格
 * @param p_string 字符串/数字/空串/null
 * @returns {string}
 */
function trim(p_string)
{
	if (p_string == null)
	{
		return "";
	}
	return p_string.replace(/^\s+|\s+$/g, '');

}
global.trim = trim;

function queryUrl($query)
{
	var res = Object.create(null)
	var url = $query.split("?")[0];
	var port = url.split("://")[0];
	port != "" && (port += "://");
	var tempurl = url.substr(port.length);
	var host = port + tempurl.substring(0, tempurl.indexOf("/"));
	$query = $query.replace(url, "");
	var query = Object.create(null);
	var bookmark = "";
	$query = $query.trim().replace(/^(\?|#|&)/, '')
	if ($query.indexOf('#') > 0)
	{
		bookmark = $query.substr($query.indexOf('#') + 1);
		$query = $query.replace('#' + bookmark, '');
	}

	if ($query)
	{
		$query.split('&').forEach(function (param)
		{
			var parts = param.replace(/\+/g, ' ').split('=')
			var key = decodeURIComponent(parts.shift())
			var val = parts.length > 0
				? decodeURIComponent(parts.join('='))
				: null

			if (query[key] === undefined)
			{
				query[key] = val
			}
			else if (Array.isArray(query[key]))
			{
				query[key].push(val)
			}
			else
			{
				query[key] = [query[key], val]
			}
		})
	}
	res.url = url;
	res.host = host;
	res.bookmark = bookmark;
	res.query = query;
	return res
}
global.queryUrl = queryUrl;

// function __extends(d, b)
// {
// 	for (var p in b)
// 	{
// 		if (b.hasOwnProperty(p))
// 		{
// 			d[p] = b[p];
// 		}
// 	}
// 	function __()
// 	{
// 		this.constructor = d;
// 	}
//
// 	__.prototype = b.prototype;
// 	d.prototype = new __();
// 	d.prototype.constructor = d;
// 	return d.prototype;
// };
// global.__extends = __extends;

/**
 * 合并两个对象（将第二个对象合并到第一个对象），也可用于深度复制
 * @param d 要输出的对象
 * @param b 要合并的对象
 * @param cover 是否覆盖属性
 * @private
 */
function __merge(d, b, cover)
{
	if (b)
	{
		for (var k in b)
		{
			if (typeof b[k] == "object" && (!d[k] || typeof d[k] == "object"))
			{
				if (Array.isArray(b[k]))
				{
					d[k] = d[k] || [];
				}
				else
				{
					d[k] = d[k] || {};
				}
				__merge(d[k], b[k], cover);
				__merge(d[k], b[k], cover);
			}
			else
			{
				(!(!cover && d.hasOwnProperty(k))) && (d[k] = b[k])
			}
		}
	}
	return d;
}
global.__merge = __merge;

function __copy(d, b, createNew)
{
	var r = {};
	for (var k in b)
	{
		(d.hasOwnProperty(k) || createNew) && (r[k] = b[k])
	}
	return r;
}
global.__copy = __copy;

function getObject($dObj, $key, $defaultValue)
{
	$defaultValue = $defaultValue || [];

	if ($dObj)
	{
		if ($dObj.hasOwnProperty($key))
		{
			return $dObj[$key];
		}
	}

	return $defaultValue;
}
global.getObject = getObject;

/**
 * 判断对象的类型
 * @param $obj 传入的对象
 * @returns {string}
 */
function getType($obj)
{
	return Object.prototype.toString.call($obj).replace(/(\[)object |(\])/g, '');
}
global.getType = getType;

function defineProperty($targetObj, propertyName, getFunc, setFunc)
{
	var propertyObj = {
		enumerable: !0,
		configurable: !0
	}

	getFunc && (propertyObj.get = getFunc);
	setFunc && (propertyObj.set = setFunc);

	Object.defineProperty($targetObj, propertyName, propertyObj);
}
global.defineProperty = defineProperty;

function exec(cmd)
{
	return require('child_process').execSync(cmd).toString().trim();
}
global.exec = exec;

function formatResponse($cmd, $dataObj, error)
{
	var result = {
		cmd: $cmd,
		status: 1,
		data: $dataObj,
	};

	if (error)
	{
		result.error = error;
		result.status = 0;
	}

	return result;
}
global.formatResponse = formatResponse;

function isString($str)
{
	return typeof $str == "string";
}
global.isString = isString;

function debug($obj)
{
	return debuga({}, $obj, 0);

	function debuga(hash, obj, depth)
	{
		if (obj == null || obj == undefined || typeof obj == "number" || typeof obj == "string" || typeof obj == "boolean")
		{
			return obj;
		}
		else if (Array.isArray(obj))
		{
			var a = [];
			for (var i = 0; i < obj.length; i++)
			{
				a[i] = debuga({}, obj[i], depth + 1);
			}
			return a;
		}
		else if (typeof obj == "function")
		{
			return "[function]";
		}
		else
		{

			if (depth >= 7)
			{
				return "[object object]";
			}

			for (var k in obj)
			{
				hash[k] = debuga({}, obj[k], depth + 1);
			}
			return hash;
		}
	}
}
global.debug = debug;

function isEmpty($obj)
{
	if (typeof $obj == "number" || typeof $obj == "boolean" || typeof $obj == "string")
	{
		return false;
	}

	if (!$obj)
	{
		return true;
	}

	return Object.keys($obj).length == 0
}
global.isEmpty = isEmpty;

function getArgs($index, $defaultValue)
{
	if ($index == null)
	{
		$index = -1;
	}
	if ($defaultValue === undefined)
	{
		$defaultValue = "";
	}
	var args = process.argv.concat();
	args.splice(0, 2);
	if ($index >= 0)
	{
		return getValueByKey(args, $index, $defaultValue);
	}
	return args;
}

function getValueByKey($obj, $key, $defaultValue)
{
	if ($defaultValue === undefined)
	{
		$defaultValue = 0;
	}

	if ($obj != null && $key != null && $obj[$key])
	{
		return $obj[$key];
	}

	return $defaultValue;
}
global.getArgs = getArgs;
global.getValueByKey = getValueByKey;