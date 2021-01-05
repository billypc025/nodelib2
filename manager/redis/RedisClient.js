/**
 * Created by billy on 2021/1/5.
 */
var _module = require("../../module/module");
var exec = require("child_process").exec;
var Redis = require("redis");
var promisify = require("./promisify");
var cmdList = require("./redis-cmd.json");

class RedisClient {
	constructor($db, $param)
	{
		this.cmdList = cmdList;
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
			this[cmd] = promisify(client[cmd]).bind(client);
		}
		this.client = client;
	}

	async init()
	{
		await this.select(this.db);
		this.isInit = true;
	}
}

RedisClient.constructor.name = "RedisClient";
module.exports = RedisClient;