/**
 * Created by billy on 2016/11/30.
 */
import HashObject from '../base/HashObject';

var Event = (function (_super) {
	__extends(Event, _super);
	function Event(type, bubbles, cancelable, data) {
		_super.call(this);
		/**
		 * @private
		 */
		this.$eventPhase = 2;
		/**
		 * @private
		 */
		this.$currentTarget = null;
		/**
		 * @private
		 */
		this.$target = null;
		/**
		 * @private
		 */
		this.$isDefaultPrevented = false;
		/**
		 * @private
		 */
		this.$isPropagationStopped = false;
		/**
		 * @private
		 */
		this.$isPropagationImmediateStopped = false;
		this.$type = type;
		this.$bubbles = !!bubbles;
		this.$cancelable = !!cancelable;
		this.data = data;
	}
	var d = __define,c=Event,p=c.prototype;
	d(p, "type"
		,function () {
			return this.$type;
		}
	);
	d(p, "bubbles"
		,function () {
			return this.$bubbles;
		}
	);
	d(p, "cancelable"
		,function () {
			return this.$cancelable;
		}
	);
	d(p, "eventPhase"
		,function () {
			return this.$eventPhase;
		}
	);
	d(p, "currentTarget"
		,function () {
			return this.$currentTarget;
		}
	);
	d(p, "target"
		,function () {
			return this.$target;
		}
	);
	p.$setTarget = function (target) {
		this.$target = target;
		return true;
	};
	p.isDefaultPrevented = function () {
		return this.$isDefaultPrevented;
	};
	p.preventDefault = function () {
		if (this.$cancelable)
			this.$isDefaultPrevented = true;
	};
	p.stopPropagation = function () {
		if (this.$bubbles)
			this.$isPropagationStopped = true;
	};
	p.stopImmediatePropagation = function () {
		if (this.$bubbles)
			this.$isPropagationImmediateStopped = true;
	};
	p.clean = function () {
		this.data = this.$currentTarget = null;
		this.$setTarget(null);
	};
	Event.dispatchEvent = function (target, type, bubbles, data) {
		if (bubbles === void 0) { bubbles = false; }
		var event = Event.create(Event, type, bubbles);
		var props = Event._getPropertyData(Event);
		if (data != undefined) {
			props.data = data;
		}
		var result = target.dispatchEvent(event);
		Event.release(event);
		return result;
	};
	Event._getPropertyData = function (EventClass) {
		var props = EventClass._props;
		if (!props)
			props = EventClass._props = {};
		return props;
	};
	Event.create = function (EventClass, type, bubbles, cancelable) {
		var eventPool = EventClass.eventPool;
		if (!eventPool) {
			eventPool = EventClass.eventPool = [];
		}
		if (eventPool.length) {
			var event = eventPool.pop();
			event.$type = type;
			event.$bubbles = !!bubbles;
			event.$cancelable = !!cancelable;
			event.$isDefaultPrevented = false;
			event.$isPropagationStopped = false;
			event.$isPropagationImmediateStopped = false;
			event.$eventPhase = 2 /* AT_TARGET */;
			return event;
		}
		return new EventClass(type, bubbles, cancelable);
	};
	Event.release = function (event) {
		event.clean();
		var EventClass = Object.getPrototypeOf(event).constructor;
		EventClass.eventPool.push(event);
	};
	Event.ADDED_TO_STAGE = "addedToStage";
	Event.REMOVED_FROM_STAGE = "removedFromStage";
	Event.ADDED = "added";
	Event.REMOVED = "removed";
	Event.ENTER_FRAME = "enterFrame";
	Event.RENDER = "render";
	Event.RESIZE = "resize";
	Event.CHANGE = "change";
	Event.CHANGING = "changing";
	Event.COMPLETE = "complete";
	Event.LOOP_COMPLETE = "loopComplete";
	Event.FOCUS_IN = "focusIn";
	Event.FOCUS_OUT = "focusOut";
	Event.ENDED = "ended";
	Event.ACTIVATE = "activate";
	Event.DEACTIVATE = "deactivate";
	Event.CLOSE = "close";
	Event.CONNECT = "connect";
	Event.LEAVE_STAGE = "leaveStage";
	Event.SOUND_COMPLETE = "soundComplete";
	return Event;
}(HashObject));

export  default Event;