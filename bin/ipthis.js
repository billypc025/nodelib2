#!/usr/bin/env node
/**
 * Created by billy on 2020/8/14.
 */
require("../global");
var os = require('os');

var netListHash = os.networkInterfaces();

var list = [];
for (var netName in netListHash)
{
	var netList = netListHash[netName];
	var obj = {
		name: netName,
		list: []
	};
	for (var netItem of netList)
	{
		if (netItem.family.toLowerCase() == "ipv4" && netItem.address != "127.0.0.1")
		{
			obj.list.push(netItem);
			if (list.indexOf(obj) < 0)
			{
				list.push(obj);
			}
		}
	}
}

trace("--------------- address --------------- mask ----------------- mac --------")
for (var item of list)
{
	for (var i = 0; i < item.list.length; i++)
	{
		var net = item.list[i];
		var name = i == 0 ? item.name : "";
		trace("  " + fill(name, 10), fill(net.address), fill(net.netmask), fill(net.mac, 25))
	}
	trace("---------------------------------------------------------------------------")
}

exit();

function fill($str, $len = 20)
{
	var restLen = $len - $str.length;
	if (restLen > 0)
	{
		for (var i = 0; i < restLen; i++)
		{
			$str += " ";
		}
	}

	return $str;
}