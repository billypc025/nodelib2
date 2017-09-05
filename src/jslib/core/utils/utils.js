const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;

var isServer = false;
var ieVersion = "";
var g;

try
{
	if (navigator)
	{
		ieVersion = Number(document.documentMode);
	}
}
catch (e)
{
	if (global)
	{
		isServer = true;
	}
}

try
{
	if (window)
	{
		g = window;
	}
}
catch (e)
{
	if (global)
	{
		g = global;
	}
}

(function ($global)
{
	/**
	 * 判断对象是否是数组
	 * @param d 传入的对象
	 * @returns {boolean}
	 */
	function isArray(d)
	{
		return Array.isArray(d);
	}

	$global.isArray = isArray;

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

	$global.random = random;

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

	$global.random2Num = random2Num;

	/**
	 * 取整
	 * @param v 源数字
	 * @returns {number}
	 */
	function int(v)
	{
		return Math.floor(v);
	}

	$global.int = int;

	/**
	 * 打印日志
	 */
	function trace()
	{
		if (!!console.log.apply)
		{
			var arr = ["%c[TRACE]", "background: #42a8f1;color:#fff"];
			if (typeof arguments[0] == 'string' && arguments[0].toString().indexOf("[ERROR]") == 0)
			{
				arguments[0] = arguments[0].replace("[ERROR]", "");
				arr = ["%c[ERROR]", "background: #ff0000;color:#fff"];
			}
			for (var i = 0; i < arguments.length; i++)
			{
				arr.push(arguments[i]);
			}
			console.log.apply(console, arr);
		}
		else
		{
			var arr = [];
			for (var i = 0; i < arguments.length; i++)
			{
				arr.push(arguments[i]);
			}
			console.log(arr.join(","));
		}
	}

	$global.trace = trace;

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

	$global.paramFormat = paramFormat;

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

	$global.isNum = isNum;

	/**
	 * 去除字符串两端的空格
	 * @param p_string 字符串/数字/空串/null
	 * @returns {string}
	 */
	function trim(p_string)
	{
		return (p_string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');

	}

	$global.trim = trim;

	function camelCase($name)
	{
		return $name.replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset)
		{
			return offset ? letter.toUpperCase() : letter;
		}).replace(MOZ_HACK_REGEXP, 'Moz$1');
	};
	$global.camelCase = camelCase;

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

	$global.queryUrl = queryUrl;

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
// $global.__extends = __extends;

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
					d[k] = d[k] || {};
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

	$global.__merge = __merge;

	function __copy(d, b, createNew)
	{
		var r = {};
		for (var k in b)
		{
			(d.hasOwnProperty(k) || createNew) && (r[k] = b[k])
		}
		return r;
	}

	$global.__copy = __copy;

	function getObject($dObj, $key)
	{
		if ($dObj)
		{
			if ($dObj.hasOwnProperty($key))
			{
				return $dObj[$key];
			}
		}

		return [];
	}

	$global.getObject = getObject;

	/**
	 * 判断对象的类型
	 * @param $obj 传入的对象
	 * @returns {string}
	 */
	function getType($obj)
	{
		return Object.prototype.toString.call($obj).replace(/(\[)object |(\])/g, '');
	}

	$global.getType = getType;

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

	$global.defineProperty = defineProperty;

	/**
	 * 为dom元素添加事件监听
	 * @param $el 目标元素
	 * @param $event 事件类型
	 * @param $handler 监听器
	 */
	function on($el, $event, $handler)
	{
		if ($el && $event && $handler)
		{
			$el.addEventListener($event, $handler, false);
		}
	};
	$global.on = on;

	const off = function ($el, $event, $handler)
	{
		if ($el && $event)
		{
			$el.removeEventListener($event, $handler, false);
		}
	};
	$global.off = off;

	const once = function ($el, $event, $func)
	{
		var listener = function ()
		{
			if ($func)
			{
				$func.apply(this, arguments);
			}
			off($el, $event, listener);
		};
		on($el, $event, listener);
	};
	$global.once = once;

	function hasClass($el, $cls)
	{
		if (!$el || !$cls)
		{
			return false;
		}
		if ($cls.indexOf(' ') !== -1)
		{
			throw new Error('className should not contain space.');
		}
		if ($el.classList)
		{
			return $el.classList.contains($cls);
		}
		else
		{
			return (' ' + $el.className + ' ').indexOf(' ' + $cls + ' ') > -1;
		}
	};
	$global.hasClass = hasClass;

	function addClass($el, $cls)
	{
		if (!$el)
		{
			return;
		}
		var curClass = $el.className;
		var classes = ($cls || '').split(' ');

		for (var i = 0, j = classes.length; i < j; i++)
		{
			var clsName = classes[i];
			if (!clsName)
			{
				continue;
			}

			if ($el.classList)
			{
				$el.classList.add(clsName);
			}
			else
			{
				if (!hasClass($el, clsName))
				{
					curClass += ' ' + clsName;
				}
			}
		}
		if (!$el.classList)
		{
			$el.className = curClass;
		}
	};
	$global.addClass = addClass;

	function removeClass($el, $cls)
	{
		if (!$el || !$cls)
		{
			return;
		}
		var classes = $cls.split(' ');
		var curClass = ' ' + $el.className + ' ';

		for (var i = 0, j = classes.length; i < j; i++)
		{
			var clsName = classes[i];
			if (!clsName)
			{
				continue;
			}

			if ($el.classList)
			{
				$el.classList.remove(clsName);
			}
			else
			{
				if (hasClass($el, clsName))
				{
					curClass = curClass.replace(' ' + clsName + ' ', ' ');
				}
			}
		}
		if (!$el.classList)
		{
			$el.className = trim(curClass);
		}
	};
	$global.removeClass = removeClass;

	const getStyle = ieVersion < 9 ? function ($el, $styleName)
	{
		if (isServer)
		{
			return;
		}
		if (!$el || !$styleName)
		{
			return null;
		}
		$styleName = camelCase($styleName);
		if ($styleName === 'float')
		{
			$styleName = 'styleFloat';
		}
		try
		{
			switch ($styleName)
			{
				case 'opacity':
					try
					{
						return $el.filters.item('alpha').opacity / 100;
					}
					catch (e)
					{
						return 1.0;
					}
				default:
					return ($el.style[$styleName] || $el.currentStyle ? $el.currentStyle[$styleName] : null);
			}
		}
		catch (e)
		{
			return $el.style[$styleName];
		}
	} : function (element, styleName)
	{
		if (isServer)
		{
			return;
		}
		if (!element || !styleName)
		{
			return null;
		}
		styleName = camelCase(styleName);
		if (styleName === 'float')
		{
			styleName = 'cssFloat';
		}
		try
		{
			var computed = document.defaultView.getComputedStyle(element, '');
			return element.style[styleName] || computed ? computed[styleName] : null;
		}
		catch (e)
		{
			return element.style[styleName];
		}
	};
	$global.getStyle = getStyle;

	function setStyle($el, $styleName, $value)
	{
		if (!$el || !$styleName)
		{
			return;
		}

		if (typeof $styleName === 'object')
		{
			for (var prop in $styleName)
			{
				if ($styleName.hasOwnProperty(prop))
				{
					setStyle($el, prop, $styleName[prop]);
				}
			}
		}
		else
		{
			$styleName = camelCase($styleName);
			if ($styleName === 'opacity' && ieVersion < 9)
			{
				$el.style.filter = isNaN($value) ? '' : 'alpha(opacity=' + $value * 100 + ')';
			}
			else
			{
				$el.style[$styleName] = $value;
			}
		}
	};
	$global.setStyle = setStyle;

	function equal(...arg)
	{
		var type = getType(arg[0]);
		var value = "";

		for (var i = 1; i < arg.length; i++)
		{
			if (getType(arg[i]) != type)
			{
				return false;
			}
		}

		value = getObjectStr(arg[0]);
		for (var i = 0; i < arg.length; i++)
		{
			if (getObjectStr(arg[i]) != value)
			{
				return false;
			}
		}
		return true;
	}

	$global.equal = equal;

	function getObjectStr($dObj)
	{
		if (getType($dObj) == "Object")
		{
			var arr = [];
			for (var key in $dObj)
			{
				if (($dObj.hasOwnProperty && $dObj.hasOwnProperty(key)) || !$dObj.hasOwnProperty)
				{
					arr.push({
						name: key,
						value: $dObj[key]
					});
				}
			}

			arr.sort((a, b)=>
			{
				if (a.name <= b.name)
				{
					return -1;
				}
				return 1;
			})
			arr = arr.map((a)=>
			{
				return a.name + ":" + getObjectStr(a.value);
			})
			return "{" + arr.join(",") + "}";
		}
		else
		{
			return JSON.stringify($dObj);
		}
	}

	$global.getObjectStr = getObjectStr;

	function __mergeAll(target)
	{
		var len = arguments.length;
		var cover = true;
		if (getType(arguments[arguments.length - 1]) == "Boolean")
		{
			cover = arguments[arguments.length - 1];
			len--;
		}
		for (var i = 1, j = len; i < j; i++)
		{
			__merge(target, arguments[i], cover);
		}

		return target;
	}

	$global.__mergeAll = __mergeAll;

	function getArgs($args, $paramDescList)
	{
		for (var i = 0; i < $paramDescList.length; i++)
		{
			var paramList = $paramDescList[i];

			if (paramList.length - 1 != $args.length)
			{
				continue;
			}
			else
			{
				var isEqual = true;
				var $func = paramList[paramList.length - 1];
				for (var j = 0; j < paramList.length - 1; j++)
				{
					if (getType($args[j]) != paramList[j])
					{
						isEqual = false;
						break;
					}
				}

				if (isEqual)
				{
					$func($args);
					break;
				}
			}
		}
	}

	$global.getArgs = getArgs;

// $global.test = function ()
// {
// 	var num, str, callBack, errorFunc;
// 	getArgs(arguments, [
// 		["Number", "String", "Function", (args)=>
// 		{
// 			num = args[0]
// 			str = args[1];
// 			callBack = args[2];
// 			errorFunc = null;
// 			trace(11111)
// 		}], ["Number", "Function", "Function", (args)=>
// 		{
// 			num = args[0]
// 			str = "asdas";
// 			callBack = args[1];
// 			errorFunc = args[2];
// 			trace(2222)
// 		}]]);
//
// 	trace(num, str, callBack, errorFunc);
// }

})(g);
