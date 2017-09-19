/**
 * Created by billy on 2017/4/25.
 */
var g = require("../global");
var Manager = require("./Manager");
var time = require("../utils/TimeTool");
var _defaultPort = 12000;

g.data.clientPool = require("../data/SocketClientPool");

module.exports = class extends Manager {
	init()
	{
		this.managerType = "Socket";
		this.clientPool = g.data.clientPool.get(this.name);
		this.server = null;
		this.port = this.param.port || _defaultPort;
		this.requireLogin = !!this.param.requireLogin;
		this.timeoutId = 0;
		if (this.requireLogin)
		{
			var varType = typeof this.param.requireLogin;
			this.loginTimeout = 5000;
			this.loginModule = "/login/login";
			if (varType == "object")
			{
				this.loginTimeout = this.param.requireLogin.timeout || this.loginTimeout;
				this.loginModule = this.param.requireLogin.module || this.loginModule;
			}
			else if (varType == "number")
			{
				this.loginTimeout = this.param.requireLogin;
			}
			else if (varType == "string")
			{
				this.loginModule = this.param.requireLogin;
			}
		}
		this.loginTimeoutList = [];
		super.init();
	}

	start()
	{
		this.initServer();
		super.start();
	}

	initServer()
	{
		this.server = require("socket.io")(this.param);
		if (this.param.redis && !isEmpty(this.param.redis))
		{
			try
			{
				var redis = require('socket.io-redis');
				this.server.adapter(redis(this.param.redis));
			}
			catch (e)
			{
				log.error(this.getMsg("不存在的redis"));
			}
		}

		this.server.on('connection', ($client)=>
		{
//			var startTime = 0;
//			startTime = Date.now();
//			trace("[connection]", $client.client.id);
//			for (var n in $client.client.server.nsps)
//			{
//				trace(n);
//			}
			this.clientPool.add($client);

			if (this.requireLogin)
			{
				this.addLoginCheckList($client.id);
			}
			else
			{
				this.clientPool.addList($client.id);
			}

			$client.onevent = ($data)=>
			{
				//返回结构如下：
				//{type:2,nsp:'/',data:[eventType,params]};
//				log.log("[Socket] " + this.name + "[recieved]", $data)
				if (!this.requireLogin || this.clientPool.get($client.id).isLogin)
				{
					go(this, $data, $client);
				}
				else if ($data.data.length > 0 && $data.data[0] == "login")
				{
					//这里应该使用一个标准回调，module里面只负责逻辑
					$data.data.shift();
					$data.data.unshift(this.loginModule);
					go(this, $data, $client, ($returnData, $client)=>
					{
						this.clientPool.addList($client.id);
						this.removeLoginCheckList($client.id);
					}, ($returnData, $client)=>
					{
						this.clientPool.remove($client.id);
						this.removeLoginCheckList($client.id);
						$client.disconnect();
					});
				}
			}

			$client.on('disconnect', ()=>
			{
				this.clientPool.remove($client.id);
//				trace(Date.now() - startTime);
//				trace("[disconnect]", $client.client.id);
			});
		});

		this.server.attach(this.port, this.param);
		log.info(this.getMsg("Server runing at port:", this.port));
	}

	broadcast($cmd, $data, exceptList)
	{
		if (exceptList != null)
		{
			if (!Array.isArray(exceptList))
			{
				exceptList = [exceptList];
			}

			exceptList = exceptList.map(function (v)
			{
				if (typeof v == "string")
				{
					return v;
				}
				return v.id;
			})
		}

		var clientList = this.clientPool.list;
		for (var i = 0; i < clientList.length; i++)
		{
			var clientData = this.clientPool.get(clientList[i]);
			if (exceptList == null || exceptList.indexOf(clientData.id) < 0)
			{
				clientData.client.emit("data", formatResponse($cmd || "", $data));
			}
		}
	}

	addLoginCheckList($id)
	{
		this.loginTimeoutList.push($id);
		if (this.timeoutId == 0)
		{
			this.enterFrame();
		}
	}

	removeLoginCheckList($id)
	{
		var index = this.loginTimeoutList.indexOf($id);
		if (index >= 0)
		{
			this.loginTimeoutList.splice(index, 1);
		}

		if (this.loginTimeoutList.length == 0 && this.timeoutId > 0)
		{
			clearTimeout(this.timeoutId);
			this.timeoutId = 0;
		}
	}

	enterFrame()
	{
		if (this.loginTimeoutList.length > 0)
		{
			var currTime = Date.now();
			for (var i = 0; i < this.loginTimeoutList.length; i++)
			{
				var clientData = this.clientPool.get(this.loginTimeoutList[i]);
				if (currTime - clientData.connectTime >= this.loginTimeout)
				{
					this.clientPool.remove(clientData.id);
					this.loginTimeoutList.splice(i, 1);
					i--;
					clientData.client.disconnect();
				}
				else
				{
					break;
				}
			}

			if (this.loginTimeoutList.length > 0)
			{
				this.timeoutId = setTimeout(()=>
				{
					this.enterFrame();
				}, 1000);
			}
			else
			{
				this.timeoutId = 0;
			}
		}
	}
}

function go($mgr, $data, $client, $callBack, $errorBack)
{
	var nsp = $data.nsp;
	var type = $data.type;
	var dataArr = $data.data;
	var dataType = "";
	if (dataArr.length > 0)
	{
		dataType = dataArr[0];

		var func = $mgr.getFunc(dataType);
		if (func)
		{
			func(dataArr[1], function successBack($returnObj)
				{
//					trace("[success]", dataType);
					$callBack && $callBack($returnObj, $client);
					$client.emit("data", formatResponse(dataType, $returnObj));
				},
				function errorBack($dataObj)
				{
//					trace("[error]", dataType);
					$errorBack && $errorBack($dataObj, $client);
					$client.emit("data", formatResponse(dataType, null, $returnObj));
				}, $client);
		}
		else
		{
			trace("@ Not Found Func:", dataType);
		}
	}
	else
	{
		trace("Request Error: require a eventType!");
	}
}