/**
 * Created by billy on 2017/7/11.
 */
var Timer = (function ()
{
	function Timer(delay, repeatCount)
	{
		repeatCount = repeatCount || 0;
		this._delay = 0;
		this._currentCount = 0;
		this._running = false;
		this.updateInterval = 1000;
		this.lastCount = 1000;
		this.delay = delay;
		this.repeatCount = repeatCount | 0;
	}

	var d = Object.defineProperties;
	var p = Timer.prototype;
	d(p, "delay"
		, function ()
		{
			return this._delay;
		}
		, function (value)
		{
			if (value < 1)
			{
				value = 1;
			}
			if (this._delay == value)
			{
				return;
			}
			this._delay = value;
			this.lastCount = this.updateInterval = Math.round(60 * value);
		}
	);
	d(p, "currentCount"
		, function ()
		{
			return this._currentCount;
		}
	);
	d(p, "running"
		, function ()
		{
			return this._running;
		}
	);
	p.reset = function ()
	{
		this.stop();
		this._currentCount = 0;
	};
	p.start = function ()
	{
		if (this._running)
		{
			return;
		}
//		egret.sys.$ticker.$startTick(this.$update, this);
		this._running = true;
	};
	p.stop = function ()
	{
		if (!this._running)
		{
			return;
		}
//		egret.stopTick(this.$update, this);
		this._running = false;
	};
	p.$update = function (timeStamp)
	{
		this.lastCount -= 1000;
		if (this.lastCount > 0)
		{
			return false;
		}
		this.lastCount += this.updateInterval;
		this._currentCount++;
		var complete = (this.repeatCount > 0 && this._currentCount >= this.repeatCount);
		egret.TimerEvent.dispatchTimerEvent(this, egret.TimerEvent.TIMER);
		if (complete)
		{
			this.stop();
			egret.TimerEvent.dispatchTimerEvent(this, egret.TimerEvent.TIMER_COMPLETE);
		}
		return false;
	};
	return Timer;
})();