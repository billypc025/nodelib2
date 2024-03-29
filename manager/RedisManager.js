/**
 * Created by billy on 2017/8/26.
 */
var g = require("../global");
var _timeTool = require("../utils/TimeTool");
var Manager = require("./Manager");
var RedisClient = require("./redis/RedisClient");

module.exports = class extends Manager {

	init()
	{
		this._defaultDB = this.param.defaultDB || -1;
		this._serverHash = {};
		this.server = {
			_param: this.param,
			getInstance: this.getInstance.bind(this),
			_serverHash: this._serverHash
		};
		this._isConnected = false;
		this.managerType = "Redis";
		if (!this.param.hasOwnProperty("allows") || this.param.allows.indexOf(__ip) >= 0)
		{
			this._isConnected = true;
		}

		/*
		 this.server = new Redis(
		 {
		 port: this.param.port,                // Redis port
		 host: this.param.host,                // Redis host
		 password: this.param.password
		 });
		 this.logLimit = this.param.logLimit || 5000;

		 if (this.param.monitor)
		 {
		 this.logNum = 0;
		 this.log = "";
		 this.currLog = {
		 time: 0,
		 list: []
		 };

		 this.monitor = this.param.monitor;
		 this.server.monitor(($err, $monitor)=>
		 {
		 g.data.server.addServer(this.name, this.server);
		 $monitor.on('monitor', ($time, $args, $source, $database)=>
		 {
		 if ($args.indexOf("exec") == 0)
		 {
		 this.logNum++;
		 this.log += this.currLog.list.join(",");
		 this.currLog = {
		 time: 0,
		 list: []
		 };
		 if (this.logNum >= this.logLimit)
		 {
		 g.fs.writeFileSync(g.path.resolve(this.param.monitor) + "log_" + timeTool.getNowStamp() + ".txt", this.log);
		 this.logNum = 0;
		 this.log = "";
		 }
		 }
		 else
		 {
		 if ($time != this.currLog.time)
		 {
		 var t0 = $time - this.currLog.time
		 this.currLog.list.push(t0 + " " + $args.join(" "));
		 this.currLog.time = $time;
		 }
		 else
		 {
		 this.currLog.list.push($args.join(" "));
		 }
		 }
		 });
		 });
		 }
		 */

		super.init();
		var server = this.getInstance(this.param.db || (this._defaultDB >= 0 ? this._defaultDB : null) || 0);
		this._serverHash[0] = [server];
		for (var cmd of server.cmdList)
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
					else
					{
						if (this._defaultDB >= 0)
						{
							db = this._defaultDB;
						}
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

		this.server["multi"] = (db = -1)=>
		{
			if (db == -1)
			{
				if (this._defaultDB >= 0)
				{
					db = this._defaultDB;
				}
				else
				{
					db = 0;
				}
			}
			db = parseInt(db);
			if (db < 0 || db > 15)
			{
				db = 0;
			}
			var server = this.getInstance(0);
			server.isFree = false;
			var multi = server.multi();

			if (!server.isInit)
			{
				server.client.select(db);
			}
			return multi;
		}

		this.server.setDB = this.setDB.bind(this);
		this.server.clearDB = this.clearDB.bind(this);
	}

	setDB($db)
	{
		if ($db >= 0 && $db < 16)
		{
			this._defaultDB = $db;
		}
	}

	clearDB()
	{
		this._defaultDB = -1;
	}

	getInstance($db)
	{
		var server;
		if (!this._serverHash[$db])
		{
			this._serverHash[$db] = [];
		}

		server = this._serverHash[$db].shift();
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