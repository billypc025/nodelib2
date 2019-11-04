/**
 * Created by billy on 2019/11/4.
 */
var _instanceHash = {};
/**
 * 根据类定义创建实例
 * @param $def 类定义
 * @param $options 构造入参
 * @param $id 实例id
 * @return {*}
 */
function _($def, $options, $id)
{
	var obj = new $def($options);
	if ($id)
	{
		_instanceHash[$id] = obj;
	}
	return obj;
}
global._ = _;

/**
 * 根据id返回运行时创建的实例
 * @param $id 实例id
 * @return {*}
 */
function $($id)
{
	var char = $id.charAt(0);
	$id = $id.substr(1);
	if (char == "#")
	{
		return _instanceHash[$id];
	}
	return null;
}
global.$ = $;