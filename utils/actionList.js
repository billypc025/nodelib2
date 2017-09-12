/**
 * Created by billy on 2017/9/7.
 */
module.exports = function ()
{
	return (function (func)
	{
		var hash = {};

		function add(funcName, func)
		{
			if (typeof funcName == "function")
			{
				func = funcName;
				funcName = func.name;
			}

			hash[funcName] = func;
		}

		function exe(...arg)
		{
			if (arg.length > 0)
			{
				var funcName = arg.splice(0, 1);
				var func = hash[funcName];
				if (func)
				{
					func.apply(func, arg);
					return true;
				}
			}
			return false;
		}

		return {
			add: add,
			exe: exe
		}
	})();
}