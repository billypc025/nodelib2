/**
 * Created by billy on 2017/3/3.
 */
// import Clickout from "./directives/clickout";
// import Focus from "./directives/focus";

var _hash = {};
add(require("./directives/clickout").default);
add(require("./directives/focus").default);

function add($item)
{
	_hash[$item.name] = $item;
}

export function init($vue, $list)
{
	var itemName;
	if (typeof $list == "string")
	{
		itemName = $list;
		if (_hash[itemName])
		{
			$vue.directive(itemName, _hash[itemName]);
		}
	}
	else if (Array.isArray($$list))
	{
		for (var i = 0; i < $list.length; i++)
		{
			itemName = $list[i];
			if (_hash[itemName])
			{
				$vue.directive(itemName, _hash[itemName]);
			}
		}
	}
}