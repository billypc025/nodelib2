/**
 * Created by billy on 2021/1/5.
 */
var _module = require("../../module/module");
var exec = require("child_process").exec;
var Redis = require("redis");
var promisify = require("./promisify");
var redisCmds = require("./redis-cmd.json");
var excludeList = ["multi"];
var EventEmitter = require('events').EventEmitter;

class RedisClient extends EventEmitter {
	constructor($db, $param)
	{
		super();
		this._id = Date.now() + "" + (Math.random() + "").substr(5, 8);
		this.cmdList = redisCmds.promisify;
		this.excludeList = excludeList;
		this.isInit = false;
		this.db = $db;
		this.param = $param;
		this.isFree = true;
		var client = Redis.createClient({
			detect_buffers: true,
			host: this.param.host
		});

		if (this.param.password)
		{
			client.auth(this.param.password);
		}

		for (var cmd of this.cmdList)
		{
			if (excludeList.indexOf(cmd) < 0)
			{
				this[cmd] = promisify(client[cmd]).bind(client);
			}
			else
			{
				this[cmd] = client[cmd].bind(client);
			}
		}
		this.client = client;
	}

	async init()
	{
		await this.select(this.db);
		this.isInit = true;
	}

	multi()
	{
		var _self = this;
		var multi = this.client.multi();
		multi.exeAsync = function (callback)
		{
			return _promise((resolved, reject)=>
			{
				this.exec((execError, results)=>
				{
					_self.emit("MULTI_COMPLETE");
					resolved(results);
				});
			})
		}
		return multi;
	}

	toString()
	{
		return this._id;
	}
}

RedisClient.constructor.name = "RedisClient";
module.exports = RedisClient;