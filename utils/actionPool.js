/**
 * Created by billy on 2017/9/7.
 */
function actionPool()
{
	return (function ()
	{
		var hash = {};
		var childActionHash = {};

		/**
		 * 新增一个方法到方法池
		 * @param $funcName 方法名
		 * @param $func 方法实体
		 * @param $actionPool 子命令池
		 */
		function add($funcName, $func, $childFuncs)
		{
			var funcName = $funcName;
			var func = $func;
			var childFuncs = $childFuncs;
			if (typeof $funcName == "function")
			{
				func = $funcName;
				funcName = func.name;

				if ($func && typeof $func == "object")
				{
					childFuncs = $func;
				}
			}

//			if (func && typeof func == "function")
			if (!hash[funcName])
			{
				//禁止覆盖已有的方法
				hash[funcName] = func;
			}

			if (childFuncs)
			{
				var childAction;
				if (childActionHash[funcName])
				{
					childAction = childActionHash[funcName];
				}
				else
				{
					childAction = actionPool();
					childActionHash[funcName] = childAction;
				}
				childAction.adds(childFuncs);
			}
		}

		function adds($actions)
		{
			if (arguments.length > 1 || Array.isArray($actions))
			{
				var list;
				if (arguments.length > 1)
				{
					//入参是...arg
					//示例: adds(init,open,add,update);
					list = arguments;
				}
				else
				{
					//入参是数组
					//示例: adds([init,open,add,update]);
					list = $actions;
				}

				for (var i = 0; i < list.length; i++)
				{
					var actionItem = list[i];
					if (Array.isArray(actionItem))
					{
						add.apply(add, actionItem);
					}
					else
					{
						add(actionItem);
					}
				}
			}
			else if (typeof $actions == "object")
			{
				//入参是键值对
				//示例: adds({init:init,open:open});
				for (var actionName in $actions)
				{
					var actionItem = $actions[actionName];
					if (Array.isArray(actionItem))
					{
						actionItem.unshift(actionName);
						add.apply(add, actionItem);
					}
					else
					{
						add(actionName, actionItem);
					}
				}
			}
			else
			{
				add($actions);
			}
		}

		/**
		 * 根据传入的一系列参数，从方发池里执行对应的方法，并传入参数
		 * @param arg 入参，0方法名 1-n为入参
		 * @returns {boolean} 返回是否成功执行方法
		 */
		function exe(...arg)
		{
			if (arg.length > 0)
			{
				var funcName = arg.splice(0, 1);
				var func = hash[funcName];
				if (func)
				{
					var childAction = childActionHash[funcName];
					if (childAction)
					{
						arg.unshift(childAction);
					}
					func.apply(func, arg);
					return true;
				}
			}
			return false;
		}

		return {
			add: add,
			adds: adds,
			exe: exe
		}
	})();
}

module.exports = actionPool;