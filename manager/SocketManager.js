/**
 * Created by billy on 2017/4/25.
 */
var g = require("../global");
var Manager = require("./Manager");
var time = require("../utils/TimeTool");
var _defaultPort = 12000;

module.exports = class extends Manager {
	init()
	{
		this.server = null;
		this.port = this.param.port || _defaultPort;
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
			var redis = require('socket.io-redis');
			this.server.adapter(redis(this.param.redis));
		}

		this.server.on('connection', ($client)=>
		{
			startTime = Date.now();
//			trace("[connection]", $client.client.id);
//			for (var n in $client.client.server.nsps)
//			{
//				trace(n);
//			}

			$client.onevent = ($data)=>
			{
				//返回结构如下：
				//{type:2,nsp:'/',data:[eventType,params]};
//				log.log("[Socket] " + this.name + "[recieved]", $data)
				go(this, $data, $client);
			}

			$client.on('disconnect', function ()
			{
//				trace(Date.now() - startTime);
//				trace("[disconnect]", $client.client.id);
			});
		});

		this.server.attach(this.port, this.param);
		log.info("[Socket] " + this.name + ": Server runing at port: " + this.port);
	}
}

var startTime = 0;

function go($mgr, $data, $client)
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
					trace("[success]", dataType);
					$client.emit("data", formatResponse(dataType, $returnObj));
				},
				function errorBack($dataObj)
				{
					trace("[error]", dataType);
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