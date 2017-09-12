/**
 * Created by billy on 2017/2/25.
 */
var Readline = require('readline');

var rl
if (!rl)
{
	rl = Readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
}

function show($msg)
{
	$msg = $msg || "";
	return new Promise(function (resolved, reject)
	{
		rl.question($msg, onComplete);

		function onComplete()
		{
			resolved.apply(null, arguments);
		}
	});
}

function showYesNo($msg)
{
	$msg = $msg || "";
	$msg += " (Y/N)";
	return new Promise(function (resolved, reject)
	{
		rl.question($msg, onComplete);

		function onComplete(v)
		{
			v = v.toUpperCase() == "Y" ? "Y" : "N"
			resolved(v);
		}
	});
}

module.exports = {
	show: show,
	showYesNo: showYesNo
}