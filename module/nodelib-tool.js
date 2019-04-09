/**
 * Created by billy on 2019/4/3.
 */
var co = require("co");
var qs = require('querystring');
var _timeTool = require("../utils/TimeTool");
var serverManager = require("../manager/ServerManager");
var managerPool = require("../data/ManagerPool");

var _cmdHash = {
	admin: admin,
	reboot: reboot,
	update_router: update_router
}
var _currCmd = "";

function check($cmd)
{
	if (_currCmd)
	{
		//上一个命令没执行完
		return false;
	}

	if ($cmd.indexOf("/nodelib-tool/") != 0)
	{
		return false;
	}

	var cmdArr = $cmd.split("/");
	if (cmdArr.length != 4 || cmdArr[2].length == 0 || !_cmdHash[cmdArr[3]])
	{
		return false;
	}

	if (g.md5(cmdArr[2]).toUpperCase() != g.data.server.pass.toUpperCase())
	{
		return false;
	}

	_currCmd = cmdArr[3];
	return true;
}

function exe($request, $response)
{
	if (!_currCmd || !_cmdHash[_currCmd])
	{
		return;
	}

	_cmdHash[_currCmd]($request, $response);
}

function admin($request, $response)
{
	_currCmd = "";
	var serverInfo = g.data.server;
	var managerList = [];
	for (var manager of serverInfo.managerList)
	{
		managerList.push({
			name: manager.name,
			type: manager.type,
			info: getInfo(manager),
			enabled: manager.enabled
		});
	}

	var html = g.fs.readFileSync(__libpath("../admin/index.html")).toString();
	html = paramFormat(html, {
		serverData: JSON.stringify({
			path: serverInfo.path,
			startTime: _timeTool.formatTime(serverInfo.startTime, true),
		}),
		managerList: JSON.stringify(managerList)
	})
	response(html, $response);
}

function reboot($request, $response)
{
	stopAllManager();
	managerPool.clear();
	serverManager.start({router: g.data.server.path});
	global.emiter.once("ALL_INITED", ()=>
	{
		_currCmd = "";
		response("ok", $response);
	})
}

function update_router($request, $response)
{
	_currCmd = "";
	getPostData($request).then(($data)=>
	{
		if (!hasData($data, "name"))
		{
			response("", $response);
			return;
		}
		var managerName = $data.name;

		response($data.name, $response);
	});
}

exports.check = check;
exports.exe = exe;

function getInfo($managerObj)
{
	var results = [];
	if ($managerObj.type == "mysql")
	{
		let param = $managerObj.param;
		results.push(info("Host", param.host));
		results.push(info("DB", param.database));
		results.push(info("User", param.user));
	}
	else if ($managerObj.type == "redis")
	{
		let param = $managerObj.param;
		results.push(info("Host", param.host));
		results.push(info("Port", param.port));
	}
	else if ($managerObj.type == "script")
	{
		let module = $managerObj.module;
		if (module)
		{
			let arr = Object.keys(module);
			results.push(mod(arr[0], module[arr[0]]));
		}
	}
	else if ($managerObj.type == "http")
	{
		let param = $managerObj.param;
		if (param)
		{
			if (param.port)
			{
				results.push(info("Port", param.port));
			}
		}
		let module = $managerObj.module;
		if (module)
		{
			let arr = Object.keys(module);
			for (var modName of arr)
			{
				results.push(mod(modName, module[modName]));
			}
		}
	}

	return results;

	function info($name, $val)
	{
		return {
			type: 1,
			name: $name,
			val: $val
		}
	}

	function mod($name, $val)
	{
		return {
			type: 2,
			name: $name,
			val: $val
		}
	}
}

function getPostData($request)
{
	var promise = new Promise((resolved, reject)=>
	{
		var postData = "";
		$request.addListener("data", function (data)
		{
			postData += data.toString();
		});
		$request.addListener("end", function ()
		{
			let query;
			if ((postData.charAt(0) == "{" && postData.charAt(postData.length - 1) == "}")
				|| (postData.charAt(0) == "[" && postData.charAt(postData.length - 1) == "]"))
			{
				try
				{
					query = JSON.parse(postData);
				}
				catch (e)
				{
					query = qs.parse(postData);
				}
			}
			else
			{
				query = qs.parse(postData);
			}

			resolved(query);
		});
	})

	return promise;
}

function response($content, $response)
{
	$response.writeHead(200, {"Content-Type": "text/html"});
	$response.write($content, "utf8", function ()
	{
		$response.end();
	});
}

function stopAllManager()
{
	co(function*()
	{
		for (var manager of managerPool.list)
		{
			yield stopManager(manager);
		}
	}).catch(function (err)
	{
	});
}

function stopManager($manager)
{
	var promise = new Promise((resolved, rejecgt)=>
	{
		var childPromise;
		if (!$manager.enabled)
		{
			return;
		}

		if ($manager.type == "http" || $manager.type == "mysql")
		{
			childPromise = $manager.manager.close();
		}

		if (childPromise)
		{
			childPromise.then(()=>
			{
				resolved();
			})
		}
		else
		{
			resolved();
		}
	});

	return promise;
}