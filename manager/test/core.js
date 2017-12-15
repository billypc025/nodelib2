/**
 * Created by billy on 2017/12/4.
 */
var _req = require("superagent");
var EventEmitter = require("events").EventEmitter;

var _emiter = new EventEmitter();
var _param;
var _list = [];
var _cookies = [];
var _count = 1;
var _isRunning = false;

var _httpInfo = {};
_httpInfo.result = {
	k: "result",
	v: 1
};
_httpInfo.data = {
	k: "data"
};
_httpInfo.error = {
	k: "errorCode",
}

_httpInfo.errorMsg = {
	k: "errorMsg",
};

global.addMsg = addMsg;
global.addTest = addTest;
global.addModule = addModule;

exports.init = function ($param)
{
	_param = $param || {};

//	_httpInfo = __merge(_httpInfo, _param.req, true);

	if (_param.hasOwnProperty("req"))
	{
		if (_param.req.hasOwnProperty("result"))
		{
			_httpInfo.result.k = _param.req.result.name;
			_httpInfo.result.v = _param.req.result.success;
		}

		if (_param.req.hasOwnProperty("data"))
		{
			_httpInfo.data.k = _param.req.data.name;
		}

		if (_param.req.hasOwnProperty("error"))
		{
			_httpInfo.error.k = _param.req.error.name;
		}

		if (_param.req.hasOwnProperty("errorMsg"))
		{
			_httpInfo.errorMsg.k = _param.req.errorMsg.name;
		}
	}
	delete _param.rep;
}

exports.on = function (...arg)
{
	_emiter.on.apply(_emiter, arg);
}

//$url, $func, $param, $method, $callBack

//$url, $func, $param, $callBack      "" "" {} ()
//$url, $func, $method, $callBack     "" "" "" ()
//$url, $func, $param, $method        "" "" {} ""
//$func, $param, $method, $callBack   "" {} "" ()

//$url, $func, $callBack      "" "" ()
//$url, $func, $method        "" "" ""
//$url, $func, $param         "" "" {}
//$func, $param, $callBack    "" {} ()
//$func, $param, $method      "" {} ""
//$func, $method, $callBack   "" "" ()

//$url, $func         "" ""
//$func, $param       "" {}
//$func, $method      "" ""
//$func, $callBack    "" ()

//$msg
var _overloadHash = {
	"h'{}()": ["url", "func", "param", "callback"],
	"h''()": ["url", "func", "method", "callback"],
	"h'{}'": ["url", "func", "param", "method"],
	"''{}'": ["func", "param", "method", "callback"],

	"h'()": ["url", "func", "callback"],
	"h''": ["url", "func", "method"],
	"h'{}": ["url", "func", "param"],
	"'{}()": ["func", "param", "callback"],
	"'{}'": ["func", "param", "method"],
	"''()": ["func", "method", "callback"],

	"h'": ["url", "func"],
	"'{}": ["func", "param"],
	"''": ["func", "method"],
	"'()": ["func", "callback"],

	"'": ["msg"]
}

function formatParam()
{
	var obj = {};
	var arg = [];
	for (var i = 0, l = arguments.length; i < l; i++)
	{
		if (arguments[i] != null && arguments[i] != undefined)
		{
			arg.push(arguments[i]);
		}
	}

	var typeStr = arg.map(function (v)
	{
		return getType(v);
	}).join("");

	if (arg.length == 5)
	{
		obj.url = arg[0];
		obj.func = arg[1];
		obj.param = arg[2];
		obj.method = arg[3];
		obj.callback = arg[4];
	}
	else if (arg.length > 1)
	{
		obj.url = "";
		obj.func = "";
		obj.param = {};
		obj.method = "";
		obj.callback = null;
		var list = _overloadHash[typeStr];
		if (list)
		{
			for (var i = 0; i < list.length; i++)
			{
				obj[list[i]] = arg[i];
			}
		}
	}
	else
	{
		return arg[0] + "";
	}

	return obj;
}

function getType($obj)
{
	if (typeof $obj == "string")
	{
		if ($obj.indexOf("http") >= 0)
		{
			return "h";
		}
		return "'";
	}
	else if (typeof $obj == "function")
	{
		return "()";
	}
	else if (typeof $obj == "object")
	{
		return "{}";
	}

	return 0;
}

function addModule($path)
{

}

function addMsg($msg)
{
	_list.push($msg);
}

function addTest($url, $func, $param, $method, $callBack)
{
	var paramObj = formatParam($url, $func, $param, $method, $callBack);

	if (typeof paramObj == "string")
	{
		if (_isRunning)
		{
			_list.splice(1, 0, paramObj)
		}
		else
		{
			_list.push(paramObj);
		}
	}
	else
	{
		var list = createObj(paramObj);

		for (var i = 0; i < list.length; i++)
		{
			paramObj = list[i];
			var obj = {};

			obj.url = paramObj.url || _param.url;
			obj.url = obj.url + "/" + paramObj.func;
			obj.func = paramObj.func;
			obj.method = paramObj.method || _param.method || "post";
			obj.method = obj.method.toLowerCase();
			obj.callback = paramObj.callback;

			if (obj.method == "post")
			{
				obj.param = paramObj.param;
			}
			else if (obj.method == "get")
			{
				if (paramObj.param && Object.keys(paramObj.param).length > 0)
				{
					obj.url += "?";
					for (var k in  paramObj.param)
					{
						obj.url += k + "=" + encodeURI(paramObj.param[k]);
					}
				}
			}

			obj.callback = paramObj.callback;
			if (_isRunning)
			{
				_list.splice(1, 0, obj)
			}
			else
			{
				_list.push(obj);
			}
		}
	}
}

function createObj(obj)
{
	var arrKey = [];
	var arrLen = [];
	var arrIndex = [];
	for (var k in obj.param)
	{
		if (Array.isArray(obj.param[k]) && k.charAt(0) == "$")
		{
			var valueList = obj.param[k];
			arrKey.push(k);
			arrLen.push(valueList.length);
			arrIndex.push(0);
		}
	}

	var list = [];
	while (true)
	{
		var tObj = __merge({}, obj);
//		delete tObj.param;
//		tObj.param = {};
		for (var i = 0; i < arrKey.length; i++)
		{
			var key = arrKey[i];
			var index = arrIndex[i];
			value = obj.param[key][index];
			var newKey = key.replace("$", "");
			tObj.param[newKey] = value;
		}

		list.push(tObj);

		var ti = 0;
		while (ti < arrKey.length)
		{
			arrIndex[ti] += 1;
			if (arrIndex[ti] >= arrLen[ti])
			{
				arrIndex[ti] = 0;
				ti++;
			}
			else
			{
				break;
			}
		}

		if (ti >= arrKey.length)
		{
			break;
		}
	}

	return list;
}

exports.startTest = function ()
{
	if (!_isRunning)
	{
		_isRunning = true;
		startNext();
	}
}

function success(...arg)
{
	log.success("[" + _count + "] " + arg.join(" "));
}
function error(...arg)
{
	log.error("[" + _count + "] " + arg.join(" "));
}

function startNext()
{
	this.end = function ($err)
	{
		if ($err)
		{
			error(_list[0].func, $err);
		}
		_list.shift();
		_count++;
		startNext();
	}

	if (_list.length > 0)
	{
		if (typeof _list[0] == "string")
		{
			log.info(_list[0]);
			_list.shift();
			startNext();
		}
		else
		{
			callTest(_list[0]).then((d)=>
			{
				var __result = _httpInfo.result.k;
				var __success = _httpInfo.result.v;
				var __data = _httpInfo.data.k;
				var __error = _httpInfo.error.k;
				var __errorMsg = _httpInfo.errorMsg.k;

				var obj = _list[0];
				if (d[__result] == __success)
				{
					success(_list[0].func, "success");

					if (obj.callback)
					{
						obj.callback.call(this, d.data, obj.param, _cookies);
//				this.callback = obj.callback.bind(this);
//				this.callback(d.data, obj.param, _cookies);
					}
					else
					{

						this.end();
					}
				}
				else
				{
					this.end(JSON.stringify(d[__errorMsg]));
				}
				//这中间可能要调用sql去数据库查询最终数据，所以这里也是异步的
			}, (d)=>
			{
				var obj = _list[0];
				if (obj.callback)
				{
					obj.callback.call(this, d.data, obj.param, _cookies);
//				this.callback = obj.callback.bind(this);
//				this.callback(d.data, obj.param, _cookies);
				}
				else
				{
					this.end();
				}
			});
		}
	}
	else
	{
		_isRunning = false;
		_emiter.emit("COMPLETE");
	}
}

function callTest($obj)
{
	var promise = new Promise((resloved, reject)=>
	{
		var req;
		if ($obj.method == "get")
		{
			req = _req.get($obj.url);
		}
		else
		{
			req = _req.post($obj.url);
		}

		if (_cookies.length)
		{
			req.set('Cookie', _cookies);
		}
		req.set("Content-Type", "application/json")
			.type("form")
			.send($obj.param)
			.end((err, res)=>
			{
				if (err)
				{
					reject(err);
				}
				else
				{
					if (res.headers.hasOwnProperty("set-cookie"))
					{
						_cookies = _cookies.concat(res.headers["set-cookie"]);
					}
					resloved(JSON.parse(res.text));
				}
			})

	})
	return promise;
}

//这里还需要做这样的处理
/*
 1.将test并入到nodecli
 如果test作为一个router类型的话，那么就能够通过test来创建新的router，但是这个router里面就没办法拥有多个模块
 而应该是创建另外一种类型的工程，在工程下创建的模块能自动并入到router中，去，以下列举一下目录层级，应该是这样的

 工程目录      通过nodecli init test创建
 router文件   通过nodecli add router {$name}创建
 module       通过nodecli add module {$name}创建

 这样在一个router文件中，就可以加入多个模块
 而工程的总入口文件是一个地址

 入口文件打开以后，应该是选择各个项目进行测试
 */