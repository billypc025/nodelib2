/**
 * Created by billy on 2017/9/15.
 */
var _hash = {};
var _list = [];

function init()
{
}
exports.init = init;

function add($client)
{
	var id = $client.id;
	if (!_hash[id])
	{
		_hash[id] = $client;
		_list.push($client);
	}
}
exports.add = add;

function get($id)
{
	return _hash[$id];
}
exports.get = get;

function remove($id)
{
	var client = _hash[$id];
	if (client)
	{
		_list.splice(_list.indexOf(client), 1);
		delete _hash[$id];
	}
}
exports.remove = remove;

defineProperty(exports, "list", function ()
{
	return _list;
});