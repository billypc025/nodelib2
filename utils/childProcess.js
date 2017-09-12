/**
 * Created by billy on 2017/9/6.
 */
var exec = require('child_process').exec;

exports.get = function (...arg)
{
	var child = new EXEC_CHILD();
	child.add.apply(child.add, arg);
	return child;
}

function EXEC_CHILD(...arg)
{
	this.cmdList = [];

	this.add.apply(this, arg);
}

function add(...arg)
{
	if (arg.length == 0)
	{
		return;
	}
	this.cmdList.push.apply(this.cmdList, arg);
}

EXEC_CHILD.prototype.add = add;

EXEC_CHILD.prototype.exe = function ($callBack, $errorBack)
{
	if (this.cmdList.length == 0)
	{
		$errorBack && $errorBack("requset some cmd");
	}
	else
	{
		exec(this.cmdList.join(" "), function ($error, $stdout, $stderr)
		{
			if ($error)
			{
				$errorBack && $errorBack($error, $stderr);
			}
			else if ($callBack)
			{
				$callBack($stdout);
			}
		});
	}
}