var _startTime = 0;
var _offsetTime = 0;

class GTime {
	constructor()
	{
		_startTime = Date.now();
	}

	setNow($nowTime)
	{
		if ($nowTime.toString().length != 13)
		{
			$nowTime = $nowTime * 1000;
		}
		_offsetTime = $nowTime - Date.now();
	}

	getTimer()
	{
		return Date.now() - _startTime;
	}

	get now()
	{
		return parseInt(this.realNow / 1000);
	}

	get realNow()
	{
		return Date.now() + _offsetTime;
	}
}

export default new GTime();