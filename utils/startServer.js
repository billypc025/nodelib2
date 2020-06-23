/**
 * Created by billy on 2020/1/17.
 */
module.exports = function ($routerName)
{
	var self = {};
	require("./pathTool").init(self);
	require("../bin/server")($routerName);
}