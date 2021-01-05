/**
 * Created by billy on 2020/12/23.
 */
var ansi = require("./ansi-escapes");
var stdout = process.stdout;

var _offset = 0;
var _loader = ["\\", "|", "/", "-"];
var _useLines = 0;
console.loading = function ($msg, $loading, $showLoading = true)
{
	var msg = "", loading = 0, useLines = 1;
	if (!!$loading)
	{
		useLines = $showLoading ? 2 : 1;
		msg = $msg + "";
		loading = $loading;
	}
	else
	{
		loading = $msg;
	}

	if (!isNum(loading) || loading > 100)
	{
		return;
	}

	if (loading < 100)
	{
		stdout.write(ansi.cursorHide);
		if (_useLines > 0)
		{
			stdout.write(ansi.eraseLines(_useLines));
		}
		if ($showLoading)
		{
			stdout.write(getLoadingContent(loading));
		}
		if (msg)
		{
			stdout.write(msg);
		}

		_useLines = useLines;
		return;
	}

	if (_useLines > 0)
	{
		stdout.write(ansi.eraseLines(_useLines));
		stdout.write(ansi.cursorShow);
		_useLines = 0;
	}
}
console.earseLine = function (n = 1)
{
	ansi.eraseLines(n);
}

console.ansi = {};
for (var fieldName in ansi)
{
	if (typeof ansi[fieldName] != "function")
	{
		console.ansi[fieldName] = function ()
		{
			stdout.write(ansi[fieldName]);
		};
	}
}

function getLoadingContent($loading)
{
	var columns = process.stdout.columns;
	var str = "";
	var loadingStr = $loading.toFixed(2);
	var num = 0;
	var restLen = columns - loadingStr.length - 3;
	if ($loading != "100.00")
	{
		num = parseInt(restLen * $loading / 100);
	}
	for (var i = 0; i < num; i++)
	{
		str += "=";
	}
	str += ">";

	if (str.length > 1)
	{
		str = _loader[_offset] + str.substr(1);
		_offset = (_offset + 1) % _loader.length;
	}

	for (i = 0; i < restLen - num; i++)
	{
		str += " ";
	}

	str += " " + loadingStr + "%";
	return str;
}