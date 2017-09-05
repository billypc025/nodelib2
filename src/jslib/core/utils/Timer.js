/**
 * Created by billy on 2016/11/30.
 */
import EventDispatcher from "../events/EventDispatcher";
import TimerEvent from "../events/TimerEvent";
import Tick from "./Tick";

var tick = new Tick();

var Timer = function (_super)
{
	__extends(Timer, _super);
	function Timer(delay, repeatCount)
	{
		if (repeatCount === void 0)
		{
			repeatCount = 0;
		}
		_super.call(this);
		this._delay = 0;
		this._currentCount = 0;
		this._running = false;
		this.updateInterval = 1000;
		this.lastCount = 1000;
		this.delay = delay;
		this.repeatCount = +repeatCount | 0;
	}

	var d = __define, c = Timer, p = c.prototype;
	d(p, "delay"
		, function ()
		{
			return this._delay;
		}
		, function (value)
		{
			//value = +value||0;
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
		this.lastCount = this.updateInterval = Math.round(60 * this._delay);
	};
	p.start = function ()
	{
		if (this._running)
		{
			return;
		}
		this.lastCount = this.updateInterval;
		tick.startTick(this.$update, this);
		this._running = true;
	};
	p.stop = function ()
	{
		if (!this._running)
		{
			return;
		}
		tick.stopTick(this.$update, this);
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
		TimerEvent.dispatchTimerEvent(this, TimerEvent.TIMER);
		if (complete)
		{
			this.stop();
			TimerEvent.dispatchTimerEvent(this, TimerEvent.TIMER_COMPLETE);
		}
		return false;
	};
	return Timer;
}(EventDispatcher);

export default Timer;