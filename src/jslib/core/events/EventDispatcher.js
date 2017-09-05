/**
 * Created by billy on 2016/11/30.
 */
import HashObject from "../base/HashObject";
import Event from "./Event";

var ONCE_EVENT_LIST = [];
var EventDispatcher = function (_super)
{
	__extends(EventDispatcher, _super);
	function EventDispatcher(target)
	{
		if (target === void 0)
		{
			target = null;
		}
		_super.call(this);
		this.$EventDispatcher = {
			0: target ? target : this,
			1: {},
			2: {},
			3: 0
		};
	}

	var d = __define, c = EventDispatcher, p = c.prototype;
	p.$getEventMap = function (useCapture)
	{
		var values = this.$EventDispatcher;
		var eventMap = useCapture ? values[2] : values[1];
		return eventMap;
	};
	p.addEventListener = function (type, listener, thisObject, useCapture, priority)
	{
		this.$addListener(type, listener, thisObject, useCapture, priority);
	};
	p.once = function (type, listener, thisObject, useCapture, priority)
	{
		this.$addListener(type, listener, thisObject, useCapture, priority, true);
	};
	p.$addListener = function (type, listener, thisObject, useCapture, priority, dispatchOnce)
	{
		var values = this.$EventDispatcher;
		var eventMap = useCapture ? values[2] : values[1];
		var list = eventMap[type];
		if (!list)
		{
			list = eventMap[type] = [];
		}
		else if (values[3 /* notifyLevel */] !== 0)
		{
			eventMap[type] = list = list.concat();
		}
		this.$insertEventBin(list, type, listener, thisObject, useCapture, priority, dispatchOnce);
	};
	p.$insertEventBin = function (list, type, listener, thisObject, useCapture, priority, dispatchOnce)
	{
		priority = +priority | 0;
		var insertIndex = -1;
		var length = list.length;
		for (var i = 0; i < length; i++)
		{
			var bin = list[i];
			if (bin.listener == listener && bin.thisObject == thisObject && bin.target == this)
			{
				return false;
			}
			if (insertIndex == -1 && bin.priority < priority)
			{
				insertIndex = i;
			}
		}
		var eventBin = {
			type: type,
			listener: listener,
			thisObject: thisObject,
			priority: priority,
			target: this,
			useCapture: useCapture,
			dispatchOnce: !!dispatchOnce
		};
		if (insertIndex !== -1)
		{
			list.splice(insertIndex, 0, eventBin);
		}
		else
		{
			list.push(eventBin);
		}
		return true;
	};
	p.removeEventListener = function (type, listener, thisObject, useCapture)
	{
		var values = this.$EventDispatcher;
		var eventMap = useCapture ? values[2 /* captureEventsMap */] : values[1 /* eventsMap */];
		var list = eventMap[type];
		if (!list)
		{
			return;
		}
		if (values[3 /* notifyLevel */] !== 0)
		{
			eventMap[type] = list = list.concat();
		}
		this.$removeEventBin(list, listener, thisObject);
		if (list.length == 0)
		{
			eventMap[type] = null;
		}
	};
	p.$removeEventBin = function (list, listener, thisObject)
	{
		var length = list.length;
		for (var i = 0; i < length; i++)
		{
			var bin = list[i];
			if (bin.listener == listener && bin.thisObject == thisObject && bin.target == this)
			{
				list.splice(i, 1);
				return true;
			}
		}
		return false;
	};
	p.hasEventListener = function (type)
	{
		var values = this.$EventDispatcher;
		return !!(values[1 /* eventsMap */][type] || values[2 /* captureEventsMap */][type]);
	};
	p.willTrigger = function (type)
	{
		return this.hasEventListener(type);
	};
	p.dispatchEvent = function (event)
	{
		event.$currentTarget = this.$EventDispatcher[0 /* eventTarget */];
		event.$setTarget(event.$currentTarget);
		return this.$notifyListener(event, false);
	};
	p.$notifyListener = function (event, capturePhase)
	{
		var values = this.$EventDispatcher;
		var eventMap = capturePhase ? values[2 /* captureEventsMap */] : values[1 /* eventsMap */];
		var list = eventMap[event.$type];
		if (!list)
		{
			return true;
		}
		var length = list.length;
		if (length == 0)
		{
			return true;
		}
		var onceList = ONCE_EVENT_LIST;
		values[3 /* notifyLevel */]++;
		for (var i = 0; i < length; i++)
		{
			var eventBin = list[i];
			eventBin.listener.call(eventBin.thisObject, event);
			if (eventBin.dispatchOnce)
			{
				onceList.push(eventBin);
			}
			if (event.$isPropagationImmediateStopped)
			{
				break;
			}
		}
		values[3 /* notifyLevel */]--;
		while (onceList.length)
		{
			eventBin = onceList.pop();
			eventBin.target.removeEventListener(eventBin.type, eventBin.listener, eventBin.thisObject, eventBin.useCapture);
		}
		return !event.$isDefaultPrevented;
	};
	p.dispatchEventWith = function (type, bubbles, data)
	{
		if (bubbles || this.hasEventListener(type))
		{
			var event = Event.create(Event, type, bubbles);
			event.data = data;
			var result = this.dispatchEvent(event);
			Event.release(event);
			return result;
		}
		return true;
	};
	return EventDispatcher;
}(HashObject);

export default EventDispatcher;