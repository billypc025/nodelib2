/**
 * Created by billy on 2017/6/28.
 */
var MysqlServer = require('./mysql/MysqlServer');
var Manager = require("./Manager");

var _keyHash = {};

module.exports = class extends Manager {
	init()
	{
		this.managerType = "MySql";
		var serverKey = MysqlServer.getString(this.param);
		if (!_keyHash[serverKey])
		{
			_keyHash[serverKey] = new MysqlServer(this.param);
		}
		this.server = _keyHash[serverKey];

		super.init();
	}

	query()
	{
		this.server.query.apply(this.server, arguments);
	}

	toObject()
	{
		return this.server.toObject();
	}

	connect()
	{
		this.server.connect.apply(this.server, arguments);
	}

	close()
	{
		this.server.close.apply(this.server, arguments);
	}
}