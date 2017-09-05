/**
 * Created by billy on 2016/11/30.
 */
import HashObject from '../base/HashObject';
import Event from './Event';

var TimerEvent = (function (_super)
{
	__extends(TimerEvent, _super);
	function TimerEvent(type, bubbles, cancelable)
	{
		_super.call(this, type, bubbles, cancelable);
	}

	var d = __define, c = TimerEvent, p = c.prototype;
	p.updateAfterEvent = function ()
	{
		//用于写入一个标记位，来检测是否需要立即重新渲染
		//这玩意待定吧
	};
	TimerEvent.dispatchTimerEvent = function (target, type, bubbles, cancelable)
	{
		var event = Event.create(TimerEvent, type, bubbles, cancelable);
		var result = target.dispatchEvent(event);
		Event.release(event);
		return result;
	};
	TimerEvent.TIMER = "timer";
	TimerEvent.TIMER_COMPLETE = "timerComplete";
	return TimerEvent;
}(Event));
export  default TimerEvent;