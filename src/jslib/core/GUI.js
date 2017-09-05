/**
 * Created by billy on 2017/3/10.
 */

var _vm;
var _hash = {};

var _lastShowTime = 0;
var _lastHideHandle = 0;

add("showLoading", showLoading);
add("hideLoading", hideLoading);
add("toast", toast);

export function init($vm)
{
	_vm = $vm;

	for (var funName in _hash)
	{
		let func = _hash[funName];
		_hash[funName] = function ()
		{
			func.apply(_vm, arguments);
		}
		exports[funName] = _hash[funName];
	}
}

function showLoading(dObj)
{
	_lastShowTime = Date.now();
	if (_lastHideHandle > 0)
	{
		clearTimeout(_lastHideHandle);
	}
	this.$indicator && this.$indicator.open(dObj);
}

function hideLoading()
{
	if (Date.now() - _lastShowTime >= 500)
	{
		this.$indicator && this.$indicator.close();
	}
	else
	{
		_lastHideHandle = setTimeout(()=>
		{
			this.$indicator && this.$indicator.close();
		}, 500);
	}
}

function toast(dObj)
{
	this.$toast && this.$toast(dObj);
}

function vm(func)
{
	if (_vm)
	{
		func(_vm);
	}
}

function add(funcName, func)
{
	_hash[funcName] = func;
	exports[funcName] = ()=>
	{
	};
}
