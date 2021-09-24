/**
 * Created by billy on 2020/1/17.
 */
module.exports = async function ($routerName, $options = null)
{
	var clusterNum = 1;
	if ($options)
	{
		if ($options.cluster)
		{
			var num = $options.cluster;
			var numCPUs = require("os").cpus().length;
			if (typeof num == "number")
			{
				num = Math.max(1, Math.min(numCPUs, num));
			}
			else if (typeof num === "max")
			{
				num = numCPUs;
			}
			else
			{
				num = 1;
			}
			clusterNum = num;
		}
	}

	if (clusterNum)
	{

	}

	var self = {};
	require("./pathTool").init(self);
	await require("../bin/server")($routerName);
}