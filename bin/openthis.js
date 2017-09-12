#!node
/**
 * Created by billy on 2017/9/7.
 */
var open = require('opener');
var localHost = require("../utils/localhost");
var serve = require("serve");
require("../global");

var localIp = localHost.getLocalIp();
var serverPort = getArgs(0, null) || 50000;

testPort();

function testPort()
{
	localHost.portIsFree(serverPort, function ()
	{
		serve("", {
			port: serverPort,
			ignore: ["node_modules/", ".gitignore", ".idea/", "src/"]
		})

		open("http://" + localIp + ":" + serverPort);
	}, function ()
	{
		serverPort++;
		testPort();
	})
}