/**
 * Created by billy on 2017/8/24.
 */
var ManagerData = require("./item/MangerData");

var _hash = {};
var _nameList = [];
var _list = [];

function init($managerList)
{
	if ($managerList)
	{
		if (!Array.isArray($managerList))
		{
			$managerList = [$managerList];
		}

		for (var i = 0; i < $managerList.length; i++)
		{
			if ($managerList[i].enabled)
			{
				add($managerList[i]);
			}
			else
			{
				add($managerList[i], true);
			}
		}
	}
}
exports.init = init;

function add($managerObj, skipCreat)
{
	if (skipCreat)
	{
		var name = $managerObj.name || "manager_" + _list.length;
		_list.push(name);
	}
	else
	{
		if ($managerObj.hasOwnProperty("name") && _hash[$managerObj.name])
		{
			log.error("重复的服务名称: " + $managerObj.name);
			log.info("请检查router文件确保没有重名的服务！");
			process.exit();
		}
		else
		{
			var managerData = new ManagerData($managerObj);
			if (!managerData.name)
			{
				managerData.update({name: "manager_" + (_list.length + 1)});
			}

			_hash[managerData.name] = managerData;
			_list.push(managerData);
			_nameList.push(managerData.name);
		}
	}
}
exports.add = add;

function get($name)
{
	return _hash[$name];
}
exports.get = get;

function getManager($name)
{
	if (_hash[$name])
	{
		return _hash[$name].manager;
	}

	return null;
}
exports.getManager = getManager;

defineProperty(exports, "nameList", function ()
{
	return _nameList;
});

defineProperty(exports, "list", function ()
{
	return _list;
});