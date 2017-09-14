/**
 * Created by billy on 2017/9/7.
 */
var os = require('os');
var net = require('net');

exports.getLocalIp = function ()
{
	var localIp = "127.0.0.1";
	var platform = os.platform();
	var netList = os.networkInterfaces();
	if (platform == "win32")
	{
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

exports.portIsFree = function ($port, $callback, $errorBack)
{
	var server = net.createServer().listen($port)
	server.on('listening', function ()
	{
		server.close(), $callback && $callback();
	})

	server.on('error', function (err)
	{
		err.code === 'EADDRINUSE' && $errorBack && $errorBack();
	})
}
