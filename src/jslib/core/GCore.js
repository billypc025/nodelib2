import * as GVue from "./GVue";
import * as GNet from "./GNet";
import * as GData from "./GData";
import * as GEvent from "./GEvent";
import * as GUI from "./GUI";
import "./utils/utils";

export var APP_BEFORE_VUE = "APP_BEFORE_VUE";
export var APP_VUED = "APP_VUED";
export var APP_CREATED = "APP_CREATED";

export var webParam = null;//页面入参
export var isInited = false; //是否已经启动
var _clientModeList = "";

/**
 * 初始化配置
 * @param dObj 网站config配置
 */
export function initConfig(dObj)
{
	var urlParam = queryUrl(window.location.href);
	webParam = __merge(dObj, urlParam.query);
	_clientModeList = dObj.mode;

	var host = window.location.hasOwnProperty("origin")
		? window.location.origin
		: window.location.protocol + "//" + window.location.host;
	__merge(webParam.path, {host: host});
	for (var k in webParam.path)
	{
		webParam.path[k] = analyzePath(k);
	}

	for (k in webParam.url)
	{
		replacePath(webParam.url, k);
	}

	for (k in webParam.file)
	{
		replacePath(webParam.file, k);
	}

	onMode("release") && (window.trace = ()=>
	{
	});

	function analyzePath($k)
	{
		var tempValue = webParam.path[$k];
		if (tempValue.indexOf("{$") >= 0)
		{
			var key = tempValue.match(/(?![\{\$]).+(?=[\}])/g)[0];
			var pValue = analyzePath(key);
			webParam.path[key] = pValue;
			tempValue = tempValue.replace("{$" + key + "}", pValue)
		}
		return tempValue;
	}

	function replacePath($d, $k)
	{
		var tempValue = $d[$k];
		if (tempValue.indexOf("{$") >= 0)
		{
			var key = tempValue.match(/(?![\{\$]).+(?=[\}])/g)[0];
			$d[$k] = tempValue.replace("{$" + key + "}", webParam.path[key]);
		}
	}
}

/**
 * 初始化应用
 * @param $el 父级的element
 * @param $routerList 网站路由表
 */
export function initApp($el, $routerList, $initList, $params)
{
	var step = -1;
	var initList = [];
// 	initList.push(initPath); //初始化path哈希表
// 	initList.push(startVue);  //开始运行vue
	initList.push(loadStaticData); //加载静态数据
	$initList && Array.isArray($initList) && (initList.push.apply(initList, $initList));

	GVue.init($el, $routerList, $params);
	var serverObj = {server: webParam.url.server};
	if (webParam.hasOwnProperty("http"))
	{
		serverObj.http = webParam.http;
	}
	GNet.init(serverObj);

	var initPormise = new Promise(function (resolve, reject)
	{
		for (var func of initList)
		{
			func.prototype = next.prototype;
			func.next = next;
// 			initList.push(func);
		}

		next();

		function next(d)
		{
			if (step < initList.length - 1)
			{
				step++;
				initList[step].call(next, d);
			}
			else
			{
				isInited = true;
				GEvent.dispatchEvent(APP_CREATED);
				trace("APP_CREATED");
				resolve();
			}
		}
	})

	return initPormise;
}

function loadStaticData()
{
	if (webParam.file.staticData != "")
	{
		GVue.http({
			method: 'GET',
			url: webParam.file.staticData
		}, d=>
		{
			if (typeof Blob !== 'undefined' && d.body instanceof Blob)
			{
				var reader = new FileReader()
				reader.addEventListener("loadend", ()=>
				{
					GData.init(reader.result);
					this.apply();
				})
				reader.readAsText(d.body);
			}
			else
			{
				GData.init(d.body);
				this.apply();
			}
		});
	}
	else
	{
		this.apply();
	}
}

export function start()
{
	GEvent.dispatchEvent(APP_BEFORE_VUE);
	return GVue.start().then(()=>
	{
		GUI.init(GVue.vm);
		GEvent.dispatchEvent(APP_VUED);
	});
}

export function initGlobal(g)
{
	g.path = g.config.path;
	g.param = g.config.param;
	g.webParam = g.core.webParam;
}

/**
 * 检测工作模式
 * @param 支持多个字符串参数
 * @returns {boolean}
 */
export function onMode()
{
	for (var i = 0; i < arguments.length; i++)
	{
		if (_clientModeList.indexOf(arguments[i]) < 0)
		{
			return false;
		}
	}
	return true;
};

/**
 * 刷新页面
 */
export function update()
{
	GVue.forceUpdate();
}