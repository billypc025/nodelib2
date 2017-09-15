/**
 * Created by billy on 2017/9/15.
 */
require("./global");

var child = require("./utils/childProcess").get();
child.add("node", "-v");
trace(child.show());
child.exe().then(function (d)
{

	trace("----------")
	trace(d)
	trace("-----------")
})