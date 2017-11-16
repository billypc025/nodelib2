/**
 * Created by billy on 2017/9/7.
 */
var os = require('os');
var net = require('net');

/**
 * 获取本机IP
 * @returns {string}
 */
exports.getLocalIp = function ()
{
	var localIp = "127.0.0.1";
	var platform = os.platform();
	var netList = os.networkInterfaces();
	if (platform == "win32")
	{
		trace(netList)
		netList = netList['本地连接']
	}
	else
	{
		netList = netList['en0'] || netList['eth0'];
	}

	for (var i = 0; i < netList.length; i++)
	{
		if (netList[i].family == 'IPv4')
		{
			localIp = netList[i].address;
		}
	}

	return localIp;
}

/**
 * 检测端口是否被占用
 * @param $port 待检测的端口
 * @param $callback 空闲回调
 * @param $errorBack 被占用回调
 * @returns {Promise} 回调Promise
 */
exports.portIsFree = function ($port, $callback, $errorBack)
{
	return new Promise((resolved, reject)=>
	{
		var server = net.createServer().listen($port)
		server.on('listening', function ()
		{
			server.close(), $callback && $callback();
			resolved();
		})

		server.on('error', function (err)
		{
			err.code === 'EADDRINUSE' && $errorBack && $errorBack();
			reject();
		})
	});
}
