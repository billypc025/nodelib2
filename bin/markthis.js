#!node
/**
 * Created by billy on 2017/9/7.
 */
var g = require("../global");

var fileName = getArgs(0, null);
g.mark(fileName, function ($err)
{
	if ($err)
	{
		log.error($err);
	}
	else
	{
		log.success("ALL DONE-----------------------");
	}
	process.exit();
})