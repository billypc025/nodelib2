/**
 * Created by billy on 2017/7/10.
 */
module.exports = (function ()
{
	var _hash = new Map();

	function add($func)
	{
		var workList = get("/");
		workList.add($func);
	}

	function get($name, $debug)
	{
		if ($name)
		{
			if (!_hash[$name])
			{
				_hash[$name] = createWork($name, $debug);
			}
			return _hash[$name];
		}
		return createWork(null, $debug);
	}

	function start($callBack)
	{
		var workList = get("/");
		workList.start($callBack);
	}

	return {
		add: add,
		get: get,
		start: start
	}
})();

var createWork = function ($name, $debug)
{
	var _name = $name || Date.now();
	var _cacheCmdList = [];
	var _id = Math.random();
	var _callBack;

	function add($func)
	{
		_cacheCmdList.push($func);
	}

	function start($callBack)
	{
		_callBack = $callBack;
		if (_cacheCmdList.length > 0)
		{
			if ($debug)
			{
				trace("[WORK LIST:" + _name + "] " + _cacheCmdList.length + " - " + _cacheCmdList[0].name);
			}
			var func = _cacheCmdList[0];
			func(onComplete);
		}
		else
		{
			if ($debug)
			{
				trace("[WORK LIST:" + _name + "] " + "DONE!");
			}
			_callBack && _callBack();
		}
	}

	function onComplete()
	{
		_cacheCmdList.shift();
		start(_callBack);
	}

	var returnObj = {};
	returnObj.add = add;
	returnObj.start = start;
	defineProperty(returnObj, "name", function ()
	{
		return _name;
	})

	return returnObj
}