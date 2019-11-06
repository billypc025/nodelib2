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
		return $def;
	}
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