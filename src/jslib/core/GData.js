export var supportLocalStorage = true;
var _storage;
try
{
	_storage = window.localStorage;
}
catch (e)
{
	initVirLocalStorage();
}

try
{
	save("test", "test");
	clear("test")
}
catch (e)
{
	initVirLocalStorage();
}

function initVirLocalStorage()
{
	supportLocalStorage = false;
	_storage = {_hash: {}};
	_storage.setItem = (k, v)=>
	{
		_storage._hash[k] = v;
	}

	_storage.getItem = (k)=>
	{
		return _storage._hash[k];
	}

	_storage.removeItem = (k)=>
	{
		delete _storage._hash[k];
	}
}

var pool = Object.create(null);
export var staticData;

/**
 * 存储数据到localStorage
 * @param k 键
 * @param v 值
 */
export function save(k, v)
{
	_storage.setItem(k, JSON.stringify({"data": v}));
}

/**
 * 从localStorage里面获取数据
 * @param k 键
 * @returns {*} 值
 */
export function get(k)
{
	var v = _storage.getItem(k);
	if (v == null || v == undefined || v == "null" || v == "undefined")
	{
		v = "";
		return v;
	}

	var r = JSON.parse(v);
	if (r.hasOwnProperty("data"))
	{
		return r.data;
	}

	return r;
}

/**
 * 清除localStorage里的指定键对应的数据
 * @param k 键
 */
export function clear(k)
{
	_storage.removeItem(k);
}

/**
 * 清除localStorage里面的所有数据
 */
export function clearAll()
{
	while (_storage.length > 0)
	{
		_storage.removeItem(_storage.key(0));
	}
}

/**
 * 保存数据到数据池
 * @param k 键
 * @param v 值
 */
export function savePool(k, v)
{
	pool[k] = v;
}

/**
 * 从数据池获取数据
 * @param k 键
 * @returns {*} 值
 */
export function getPool(k)
{
	return pool[k];
}

export function init($dataByte)
{
	staticData = Object.create(null);

	var a = $dataByte.split("||||");
	var len = int(a[0]);
	var list = JSON.parse(a[1].substr(0, len));
	var content = a[1].substr(len);
	for (var i = 0; i < list.length; i++)
	{
		var fileData = list[i];
		staticData[fileData[0]] = JSON.parse(content.substring(fileData[1], fileData[2]));
	}
}