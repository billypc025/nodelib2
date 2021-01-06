/**
 * Created by billy on 2020/10/15.
 */
var RedisClient = require("../manager/redis/RedisClient");

var _hash = {};
/**
 *
 * @param $param {host, password}
 */
exports.create = function ($param = {})
{
	var host = $param.host || "127.0.0.1";
	var port = $param.port || 6379;
	var password = $param.password || "";
	var serverName = $param.name || `${host}-${port}-${password}`;
	if (!_hash[serverName])
	{
		_hash[serverName] = new RedisShell(serverName, {
			host,
			port,
			password
		});
	}

	return _hash[serverName].server;
};

class RedisShell {
	constructor($serverName, $mysqlParam)
	{
		this.serverName = $serverName;
		this.param = $mysqlParam;
		this.server = {};
		this._serverHash = {};

		var server = new RedisClient(0, this.param);
		this._serverHash[0] = [server];
		for (let cmd of server.cmdList)
		{
			this.server[cmd] = (($cmd)=>
			{
				return async(...arg)=>
				{
					var db = 0;
					var arg0 = arg[0];
					if (isNum(arg0))
					{
						db = arg.shift();
						db = db - 0;
					}
					db = parseInt(db);
					if (db < 0 || db > 15)
					{
						db = 0;
					}
					var server = this.getInstance(db);
					if (!server.isInit)
					{
						await server.init();
					}

					server.isFree = false;
					var backResult = await server[$cmd].apply(server[$cmd], arg);
					server.isFree = true;
					this._serverHash[server.db].unshift(server);
					return backResult;
				}
			})(cmd)
		}

		this.server["multi"] = (db = 0)=>
		{
			db = parseInt(db);
			if (db < 0 || db > 15)
			{
				db = 0;
			}
			var server = this.getInstance(db);
			server.isFree = false;
			var multi = server.multi();

			if (!server.isInit)
			{
				server.client.select(db);
			}
			return multi;
		}
	}

	getInstance($db)
	{
		var server;
		if (!this._serverHash[$db])
		{
			this._serverHash[$db] = [];
		}

		server = this._serverHash[$db][0];
		if (!server)
		{
			server = new RedisClient($db, this.param);
			server.on("MULTI_COMPLETE", ()=>
			{
				server.isFree = true;
				this._serverHash[server.db].unshift(server);
			})
		}

		return server;
	}
}

RedisShell.constructor = "RedisShell";