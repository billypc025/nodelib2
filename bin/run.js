/**
 * Created by billy on 2019/8/30.
 */
module.exports = function ($runFile, ...arg)
{
	var $runFile = g.path.resolve("./", $runFile);
	g.argv = arg;
	require($runFile);
}