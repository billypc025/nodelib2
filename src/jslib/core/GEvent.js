export var SCENE_READY = "SCENE_READY";
var _globalEvent;
/**
 * 添加一次监听
 * @param type 监听类型
 * @param callBack 回调
 * @param match 匹配方式：true通配符   false不匹配
 *
 */
export function addEventListenerOnce(type, callBack, thisObj, match)
{
	if (thisObj === void 0)
	{
		thisObj = null;
	}
	if (match === void 0)
	{
		match = false;
	}
	_globalEvent.addEventListenerOnce(type, callBack, thisObj, match);
}
/**
 * 添加监听
 * @param type 监听类型
 * @param callBack 回调
 * @param match 匹配方式：true通配符   false不匹配
 *
 */
export function addEventListener(type, callBack, thisObj, match)
{
	if (thisObj === void 0)
	{
		thisObj = null;
	}
	if (match === void 0)
	{
		match = false;
	}
	_globalEvent.addEventListener(type, callBack, thisObj, match);
}
/**
 * 移除监听
 * @param type 监听类型
 * @param callBack 回调
 * @param match
 *
 */
export function removeEventListener(type, callBack, thisObj, match)
{
	if (thisObj === void 0)
	{
		thisObj = null;
	}
	if (match === void 0)
	{
		match = false;
	}
	_globalEvent.removeEventListener(type, callBack, thisObj, match);
}
/**
 * 派发监听回调
 * @param type 监听类型
 * @param param 所携参数
 * @param match 匹配方式
 *
 */
export function dispatchEvent(type, param, match)
{
	if (param === void 0)
	{
		param = null;
	}
	if (match === void 0)
	{
		match = false;
	}
	_globalEvent.dispatchEvent(type, param, match);
}

export function removeAllListener(type)
{
	_globalEvent.removeAllListener(type);
}

var GlobalEvent = function ()
{
	function constructor()
	{
		this._hash = [];
		this._matchHash = [];
		this._matchList = [];
	}

	var proto = constructor.prototype;
	proto.addEventListenerOnce = function ($eventType, $callBack, $targetObj, $match)
	{
		this.addEventListener($eventType, $callBack, $targetObj, $match, true);
	}

	proto.addEventListener = function ($eventType, $callBack, $targetObj, $match, $once)
	{
		void 0 === $targetObj && ($targetObj = null);
		void 0 === $match && ($match = !1);
		void 0 === $once && ($once = false);
		var hash = this.getHash($match);
		if ($targetObj == null)
		{
			$targetObj = $callBack;
		}
		var callData = hash[$eventType];
		if (callData == null)
		{
			callData = {
				"thisList": [],
				"callList": [],
				"onceList": []
			};
			hash[$eventType] = callData;
		}

		if (this._matchList == null)
		{
			this._matchList = [];
		}

		if ($match && this._matchList.indexOf($eventType) < 0)
		{
			this._matchList.push($eventType);
		}
		callData.callList.push($callBack);
		callData.thisList.push($targetObj);
		callData.onceList.push($once);
	};

	proto.removeEventListener = function ($eventType, $callBack, $targetObj, $match)
	{
		void 0 === $match && ($match = !1);
		var hash = this.getHash($match);
		var callData = hash[$eventType];
		if (callData != null && callData.callList.length > 0)
		{
			if (callData.callList.indexOf($callBack) >= 0)
			{
				var index = callData.callList.indexOf($callBack);
				callData.callList.splice(index, 1);
				callData.thisList.splice(index, 1);
				callData.onceList.splice(index, 1);
			}
		}

		if ($match && callData.callList.length == 0 && this._matchList.indexOf($eventType) >= 0)
		{
			if (this._matchList.indexOf($eventType) >= 0)
			{
				this._matchList.splice(this._matchList.indexOf($eventType), 1);
			}
		}
	};

	proto.removeAllListener = function ($type)
	{
		$type = this.getHash(false)[$type];
		if ($type && $type.callList.length > 0)
		{
			while ($type.callList.length > 0)
			{
				$type.callList.shift();
				$type.thisList.shift();
				$type.onceList.shift();
				s
			}
		}
	};

	proto.dispatchEvent = function ($type, $param, $match)
	{
		void 0 === $param && ($param = null);
		void 0 === $match && ($match = !1);
		if (!$match)
		{
			this.doEventCallBack(this.getHash($match), $type, $type, $param);
		}
		else
		{
			if (this._matchList == null)
			{
				this._matchList = [];
			}
			for (var i = 0; i < this._matchList.length; i++)
			{
				var typeStr = this._matchList[i];
				if (typeStr.indexOf("*") >= 0)
				{
					typeStr = typeStr.replace(/\*/g, "[^_.]+");
					var matchs = $type.match(typeStr);
					if (matchs && matchs.length > 0)
					{
						this.doEventCallBack(this.getHash($match), $type, this._matchList[i], $param);
					}
				}
				else if (typeStr == $type)
				{
					this.doEventCallBack(this.getHash($match), $type, this._matchList[i], $param);
				}
			}
		}
	}

	proto.doEventCallBack = function ($hash, $eventType, $etype, $param)
	{
		void 0 === $param && ($param = null);
		var callData = $hash[$etype];
		if (callData != null && callData.callList.length > 0)
		{
			var arr = callData.callList.concat();
			var thisArr = callData.thisList.concat();
			var onceArr = callData.onceList.concat();
			for (var i = 0; i < arr.length; i++)
			{
				var callBack = arr[i];
				var thisObj = thisArr[i];
				var once = onceArr[i];
				if ($param == null)
				{
					callBack.call(thisObj, $eventType);
				}
				else
				{
					callBack.call(thisObj, $eventType, $param);
				}
				if (once)
				{
					callData.callList.splice(i, 1);
					callData.thisList.splice(i, 1);
					callData.onceList.splice(i, 1);
				}
			}
			arr = null;
			thisArr = null;
		}
	};

	proto.getHash = function ($match)
	{
		void 0 === $match && ($match = false);
		return $match ? this._matchHash : this._hash;
	};
	return constructor;
}();

_globalEvent = new GlobalEvent();