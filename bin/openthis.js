#!/usr/bin/env node
/**
 * Created by billy on 2017/9/7.
 */
var open = require('opener');
var localHost = require("../utils/localhost");
require("../global");
const handler = require("serve-handler");
const http = require("http");

var localIp = localHost.getLocalIp();
var serverPort = getArgs(0, null) || 50000;

testPort();
function testPort()
{
	localHost.portIsFree(serverPort, function ()
	{
		const server = http.createServer((request, response) =>
		{
			return handler(request, response, {
				cleanUrls: false,
				"unlisted": [
					"/node_modules",
					".gitignore",
					".idea",
					"/src"
				]
			});
		})

		server.listen(serverPort, () =>
		{
			open("http://" + localIp + ":" + serverPort + getIndex());
		});
	}, function ()
	{
		serverPort++;
		testPort();
	})
}

function getIndex()
{
	var list = ["index.html", "index.htm"];
	var i = 0;
	while (i < list.length)
	{
		var indexName = list[i];
		let path = g.path.resolve("./" + indexName);
		if (g.fs.existsSync(path))
		{
			return "/" + indexName;
		}
		i++;
	}

	return "";
}