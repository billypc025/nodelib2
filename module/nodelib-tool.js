/**
 * Created by billy on 2019/4/3.
 */
var co = require("co");
var qs = require('querystring');
var _timeTool = require("../utils/TimeTool");
var _serverManager = require("../manager/ServerManager");
var _managerPool = require("../data/ManagerPool");
var _exeTool = require("../utils/childProcess");

var _cmdHash = {
	admin: admin,
	reboot: reboot,
	update_router: update_router,
	git_pull: git_pull,
	git_fetch: git_fetch
}
var _currCmd = "";
var _userHash = {};
//管理员登录可以指定一个地址用于其他人登录,有一个地址设置界面
//非管理员登录时,就需要验证身份,并根据用户hash,写入对应的token,每次接口调用后都更新token

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
	co(function*()
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

		var gitBranch = yield getGitBranch();
		var gitCommit = yield getGitCommit();
		gitCommit.time = _timeTool.formatTime(new Date(gitCommit.time).getTime());
		var html = g.fs.readFileSync(__libpath("../admin/index.html")).toString();
		html = paramFormat(html, {
			serverData: JSON.stringify({
				path: serverInfo.path,
				startTime: _timeTool.formatTime(serverInfo.startTime, true),
				gitBranch: gitBranch,
				gitCommit: gitCommit
			}),
			managerList: JSON.stringify(managerList),
		})
		response(html, $response);
	}).catch(function ($err)
	{
		response("", $response);
	})
}

function reboot($request, $response)
{
	stopAllManager();
	_managerPool.clear();
	_serverManager.start({router: g.data.server.path});
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

function git_pull($request, $response)
{
	var childExe = _exeTool.get("git pull");
	childExe.exe().then(()=>
	{
		_currCmd = "";
		response("", $response);
	}, ()=>
	{
		_currCmd = "";
		response("", $response);
	});
}

function git_fetch($request, $response)
{
	co(function*()
	{
		var childExe = _exeTool.get();
		childExe.add("git fetch origin master");
		yield childExe.exe();
		childExe.add("git log --name-status --pretty=oneline --no-merges master..origin/master");
		var msg = yield childExe.exe();
		_currCmd = "";
		response(msg, $response);
	}).catch(function ($err)
	{
		_currCmd = "";
		response("", $response);
	})
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
			if (param.protocol)
			{
				results.push(mark("Https"));
			}
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
	else if ($managerObj.type == "socket")
	{
		let param = $managerObj.param;
		if (param)
		{
			var isHttpServer = false;
			if (param.protocol)
			{
				if (param.protocol != "https")
				{
					isHttpServer = true;
					results.push(mark("Https", param.protocol));
				}
				else
				{
					results.push(mark("Https"));
				}
			}
			if (param.path)
			{
				results.push(info("Path", param.path));
			}

			if (isHttpServer)
			{
				results.push(info("Port", g.data.manager.getManager(param.protocol).data.param.port));
			}
			else if (param.port)
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

	function mark($name, $val)
	{
		return {
			type: 3,
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
	if ($content)
	{
		$response.write($content, "utf8", function ()
		{
			$response.end();
		});
	}
	else
	{
		$response.end();
	}
}

function stopAllManager()
{
	co(function*()
	{
		for (var manager of _managerPool.list)
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

		if ($manager.type == "http" || $manager.type == "mysql" || $manager.type == "socket")
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

function getGitBranch()
{
	var promise = new Promise((resolved, reject)=>
	{
		var childExe = _exeTool.get("git branch");
		childExe.exe().then(($data)=>
		{
			if ($data)
			{
				var matchs = $data.match(/\*.+/g);
				if (matchs && matchs.length > 0)
				{
					var result = matchs[0].replace("*", "");
					result = trim(result);
					resolved(result);
					return;
				}
			}
			resolved("");
		}, ()=>
		{
			resolved("");
		});
	})
	return promise;
}

function getGitCommit()
{
	var promise = new Promise((resolved, reject)=>
	{
		var childExe = _exeTool.get("git log -n 1");
		childExe.exe().then(($data)=>
		{
			if ($data)
			{
				$data = $data.toLowerCase();
				var time = trim($data.match(/date:.+/g)[0].replace("date:", ""));
				var id = trim($data.match(/commit.+/g)[0].replace("commit", ""));
				resolved({
					time: time,
					id: id
				});
			}
			resolved("");
		}, ()=>
		{
			resolved("");
		});
	})
	return promise;
}