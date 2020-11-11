/**
 * Created by billy on 2020/10/15.
 */
var MysqlServer = require("../manager/mysql/MysqlServer");

var _hash = {};
/**
 *
 * @param $param {host, user, password, database}
 */
exports.create = function ($param)
{
	var name = $param.name || "";
	var host = $param.host;
	var user = $param.user || "root";
	var password = $param.password;
	var database = $param.database || "information_schema";
	if (!host || !password)
	{
		return null;
	}

	var serverName = name || `${host}-${user}-${database}`;
	if (!_hash[serverName])
	{
		_hash[serverName] = new MysqlShell(serverName, {
			host,
			user,
			password,
			database
		});
	}

	return _hash[serverName];
};

function query($name, $sql = "")
{
	var mysql = getServer($name, $sql);
	if (!mysql)
	{
		return _promise((resolved, reject)=>
		{
			reject(new GError({msg: "访问的数据库连接不存在"}));
		})
	}

	var sqlStr = $sql || $name;
	return _promise((resolved, reject)=>
	{
		mysql.server.query(sqlStr, $list=>resolved($list), (e)=>
		{
			reject(new GError({msg: "数据库查询出错"}));
		})
	});
}
exports.query = query;

async function queryOne($name, $sql = "")
{
	var list = await query($name, $sql);
	return list[0];
};
exports.queryOne = queryOne;

function getServer($name, $sql)
{
	var server = null;
	if ($sql)
	{
		//当前指定了服务名称
		server = _hash[$name];
	}
	else
	{
		var list = Object.keys(_hash);
		if (list.length == 1)
		{
			//当前为指定服务名时,仅当有一个mysql连接时,返回这个连接
			server = _hash[list[0]];
		}
	}

	return server;
}

class MysqlShell {
	constructor($serverName, $mysqlParam)
	{
		this.serverName = $serverName;
		this.server = new MysqlServer($mysqlParam);
	}

	async query($sqlStr)
	{
		return query(this.serverName, $sqlStr);
	}

	async queryOne($sqlStr)
	{
		return queryOne(this.serverName, $sqlStr);
	}

	async select($tableName, $columns, $whereObj = {}, $sort = null, $limit = null, $page = null)
	{
		var sqlStr = sql.select($tableName, $columns, $whereObj, $sort, $limit, $page);
		return this.query(sqlStr);
	}

	async selectOne($tableName, $columns, $whereObj = {}, $sort = null, $limit = null, $page = null)
	{
		var sqlStr = sql.select($tableName, $columns, $whereObj, $sort, $limit, $page);
		return this.queryOne(sqlStr);
	}

	async update($tableName, $updateObj, $whereObj)
	{
		var sqlStr = sql.update($tableName, $updateObj, $whereObj);
		return this.query(sqlStr);
	}

	async insert($tableName, $insertObj)
	{
		var sqlStr = sql.insert($tableName, $insertObj);
		return this.query(sqlStr);
	}

	async delete($tableName, $whereObj)
	{
		var sqlStr = sql.delete($tableName, $whereObj);
		return this.query(sqlStr);
	}

	async count($tableName, $whereObj)
	{
		var sqlStr = sql.count($tableName, "total", $whereObj);
		var resultObj = await this.queryOne(sqlStr);
		return resultObj.total;
	}
}