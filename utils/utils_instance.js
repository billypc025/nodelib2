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
	if (typeof $def != "function")
	{
		if ($id)
		{
			_instanceHash[$id] = $def;
		}
		return $def;
	}

	if (!$def.prototype.constructor.name)
	{
		if ($id)
		{
			_instanceHash[$id] = $def;
		}
		return $def;
	}
	var obj;
	if (Array.isArray($options))
	{
		obj = new $def($options[0], $options[1], $options[2], $options[3], $options[4], $options[5], $options[6], $options[7], $options[8], $options[9]);
	}
	else
	{
		obj = new $def($options);
	}
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

/**
 * 创建一个promise
 * @param $callback 回调数组/回调方法
 * @return {*}
 * @private
 */
function _promise($callback)
{
	if (Array.isArray($callback))
	{
		return Promise.all($callback);
	}
	return new Promise($callback);
}
global._promise = _promise;

/**
 * 创建一个co
 * @param $callback 回调数组/回调方法
 * @return {*}
 * @private
 */
function _co($callback)
{
	co(function*()
	{
	}).catch(()=>
	{
	})
	if (Array.isArray($callback))
	{
		return Promise.all($callback);
	}
	return new Promise($callback);
}
global._co = _co;

class GError extends Error {
	constructor($data)
	{
		super("gError");
		this.data = $data
	}
}
global.GError = GError;