import * as GCore from "./GCore";
import * as GVue from "./GVue";

var _serverPath = "";
var _httpInfo = {
	method: "GET",
	mime: "json"
};
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

var _reqHash = {}; // {[url_params:string]:Promise}  请求结果缓存池
var _globalParams = {};
var _reader = null;

var _hookList = ["error", "success"];
var _hookHash = {};

// call('...',{},onResult,onError)
//call({url:'',params:{},success:null,error:null,before:null,},onResult,onError)

// $url, $method, $param, $callback, $errorback
/**
 * 发送异步http请求
 * @param args（url method params callback errorback）
 */
export function call(...args)
{
	var param = {};
	var callBack;
	var errorBack;
	var mime = "";

	if (typeof args[0] == "string")
	{
		param.url = args[0];
		if (typeof args[1] == "string")
		{
			param.method = args[1];
			if (typeof args[2] == "function")
			{
				callBack = args[2];
				errorBack = args[3];
			}
			else
			{
				param.params = args[2];
				callBack = args[3];
			}
		}
		else if (typeof args[1] == "function")
		{
			callBack = args[1];
			errorBack = args[2];
		}
		else
		{
			param.params = args[1];
			callBack = args[2];
			errorBack = args[3];
		}
	}
	else
	{
		param = args[0];
		callBack = args[1];
		errorBack = args[2];
	}

	param.method = param.method || _httpInfo.method;
	param.method = param.method.toUpperCase();
	mime = (param.params && param.params.mime) || _httpInfo.mime;
	mime = mime.toLowerCase();
	param.params && (delete param.params["mime"]);
	if (param.params)
	{
		param.params = __merge(param.params, _globalParams);
	}
	else
	{
		param.params = __merge({}, _globalParams);
	}
	if (_httpInfo.hasOwnProperty("credentials") && !param.hasOwnProperty("credentials"))
	{
		param.credentials = _httpInfo.credentials;
	}

	if (param.url.indexOf("http://") < 0 && param.url.indexOf("https://") < 0)
	{
		if (!param.params.hasOwnProperty("$trueUrl"))
		{
			if (_serverPath != "" && param.url.indexOf(_serverPath) < 0)
			{
				param.url = _serverPath + "/" + param.url;
			}
		}

		delete param.params["$trueUrl"];
	}
	if (GCore.onMode("debug"))
	{
		console.log("%c[Sending] " + param.url, "color:#3366dd", " " + JSON.stringify(param));
	}

	function onResult(d, resolve, reject)
	{
		var dObj = d.body;
		if (GCore.onMode("debug"))
		{
			console.log("%c[Received] " + param.url.replace(_serverPath, ''), "color:#3366dd", dObj);
		}

		if (typeof Blob !== 'undefined' && dObj instanceof Blob)
		{
			//如果是Blob类型的数据，异步读取返回
			if (!_reader)
			{
				_reader = new FileReader();
			}
			_reader.addEventListener("loadend", function ()
			{
				dObj = _reader.result;
				doFormatResult();
			})
			//这里是否还需要进行一个判断？
			if (mime == "image")
			{
				_reader.readAsDataURL(dObj);
			}
			else
			{
				_reader.readAsText(dObj);
			}
		}
		else
		{
			doFormatResult();
		}

		function doFormatResult()
		{
			if (mime == "json")
			{
				if (typeof dObj == "string")
				{
					try
					{
						dObj = JSON.parse(dObj)
					}
					catch (e)
					{
						trace("[ERROR]服务端返回的数据不是有效的json串!");
					}
				}

				if (param.url.indexOf(".json") + 5 == param.url.length)
				{
					doNormalCallBack();
				}
				else
				{
					doNetCallBack();
				}
			}
			else if (mime == "txt")
			{
				doNormalCallBack();
			}
			else if (mime == "image")
			{
				doNormalCallBack();
			}
		}

		function doNormalCallBack()
		{
			checkHook("success", dObj);
			callBack && callBack(dObj);
			resolve && resolve(dObj);
		}

		function doNetCallBack()
		{
			var __result = _httpInfo.result.k;
			var __success = _httpInfo.result.v;
			var __data = _httpInfo.data.k;
			var __error = _httpInfo.error.k;
			var __errorMsg = _httpInfo.errorMsg.k;

			dObj[__data] = dObj[__data] || {};
			dObj[__data].response = d;
			if (dObj[__result] == __success)
			{
				checkHook("success", dObj[__data]);
				callBack && callBack(dObj[__data]);
				resolve && resolve(dObj[__data]);
			}
			else
			{
				var errorObj = {
					status: dObj[__error],
					error: dObj[__error],
					errorData: dObj[__data],
					errorMsg: dObj[__errorMsg]
				};
				onError(errorObj, reject);
			}
		}
	}

	function onError(d, reject)
	{
		if (GCore.onMode("debug"))
		{
			trace("[ERROR]" + param.url.replace(_serverPath, ''), "status:", d.status, d);
		}

		checkHook("error", d);
		errorBack && errorBack(d);
		reject && reject(d);
	}

	function checkHook($hookName, $dataObj)
	{
		if (_hookHash[$hookName] && _hookHash[$hookName].length > 0)
		{
			for (var i = 0; i < _hookHash[$hookName].length; i++)
			{
				_hookHash[$hookName][i]($dataObj);
			}
		}
	}

	var reqKey = "" + param.url + param.method + JSON.stringify((param.params || {}));
	if (!_reqHash[reqKey] || (_reqHash[reqKey] && new Date().getTime() - _reqHash[reqKey].time >= (_httpInfo.repeatReqTime || 2000)))
	{
		var reqPromise = new Promise(function (resolve, reject)
		{
			GVue.http(param, function (d)
			{
				onResult(d, resolve, reject);
			}, function (d)
			{
				var errorObj = {
					error: 0,
					errorData: d,
					errorMsg: ""
				};

				if (d.response && d.response.status)
				{
					errorObj.status = d.response.status;
				}
				onError(errorObj, reject);
			});

		})

		_reqHash[reqKey] = {
			time: new Date().getTime(),
			promise: reqPromise
		};
	}
	else
	{
		return _reqHash[reqKey].promise;
	}

	return reqPromise;
}

export function calls(...args)
{
	var list = [];
	var callback;
	var errorback;
	if (Array.isArray(args[0]))
	{
		for (var item of args[0])
		{
			list.push(call(item));
		}
		callback = args[1];
		errorback = args[2];
	}
	else
	{
		for (var item of args)
		{
			if (typeof item != "function")
			{
				list.push(call(item));
			}
			else
			{
				!callback && (callback = item);
				callback && !errorback && (errorback = item);
			}
		}
	}

	var reqsPromise = Promise.all(list);
	reqsPromise.then(values=>
	{
		callback && callback(values)
	}, reasons=>
	{
		errorback && errorback(reasons);
	})

	return reqsPromise;
}

export function init($serverObj)
{
	_serverPath = $serverObj.server || "";
	if (_serverPath.charAt(_serverPath.length - 1) == "/")
	{
		_serverPath = _serverPath.substr(0, _serverPath.length - 1);
	}
	_httpInfo = __merge(_httpInfo, $serverObj.http, true);

	if (_httpInfo.hasOwnProperty("req"))
	{
		if (_httpInfo.req.hasOwnProperty("result"))
		{
			_httpInfo.result.k = _httpInfo.req.result.name;
			_httpInfo.result.v = _httpInfo.req.result.success;
		}

		if (_httpInfo.req.hasOwnProperty("data"))
		{
			_httpInfo.data.k = _httpInfo.req.data.name;
		}

		if (_httpInfo.req.hasOwnProperty("error"))
		{
			_httpInfo.error.k = _httpInfo.req.error.name;
		}

		if (_httpInfo.req.hasOwnProperty("errorMsg"))
		{
			_httpInfo.errorMsg.k = _httpInfo.req.errorMsg.name;
		}
	}

	if (GCore.onMode("debug"))
	{
		trace("[GNet:Init]", "SERVER_PATH:\"" + _serverPath + "\"");
	}
}

export function setGlobalParams($params, $override)
{
	if ($override)
	{
		_globalParams = $params || {};
	}
	else
	{
		_globalParams = __merge(_globalParams, $params);
	}
}

export function addHook($hookObj)
{
	for (var hookName in $hookObj)
	{
		var func = $hookObj[hookName];
		if (_hookList.indexOf(hookName) >= 0)
		{
			if (!_hookHash[hookName])
			{
				_hookHash[hookName] = [];
			}
			if (_hookHash[hookName].indexOf(func) < 0)
			{
				_hookHash[hookName].push(func)
			}
		}
	}
}

export function removeHook($hookObj)
{
	for (var hookName in $hookObj)
	{
		var func = $hookObj[hookName];
		if (_hookList.indexOf(hookName) >= 0)
		{
			if (_hookHash[hookName] && _hookHash[hookName].length > 0)
			{
				var i = _hookHash[hookName].indexOf(func);
				if (i >= 0)
				{
					_hookHash[hookName].splice(i, 1);
				}
			}
		}
	}
}