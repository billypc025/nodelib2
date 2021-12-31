/**
 * Created by billy on 2017/7/11.
 */

const EXPIRE_TIME = 0;

var _config = {
	expireTime: EXPIRE_TIME
};

var _clientConfig = {};
var _hash = {};

exports.init = function ($option)
{
	_config = __merge(_config, $option, true);
}

exports.initClient = function ($sqlClient, $option)
{
	var clientConfig = getClientConfig($sqlClient)
	clientConfig = __merge(clientConfig, $option, true);
}

exports.query = function ($sqlClient, $sql, $callBack)
{
	var sql = $sql;
	var expire = 0;
	if (!isString($sql))
	{
		if ($sql.hasOwnProperty("sql"))
		{
			sql = $sql.sql;
		}
	}
	if (_hash[$sqlClient.name] && _hash[$sqlClient.name][$sql])
	{
		$callBack
	}

	if (!_hash[$sqlClient.name])
	{
		_hash[$sqlClient.name] = {
			id: $sqlClient.name,
			expireTime: 0
		}
	}
}

function getClientConfig($client)
{
	var client = $client.name;
	if (_clientConfig[client])
	{
		_clientConfig[client] = __merge({}, _config);
	}

	return _clientConfig[client];
}