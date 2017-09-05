/**
 * Created by billy on 2016/11/30.
 */
import getTimer from'./getTimer';

var Tick = (function ()
{
	var proto = Tick.prototype;

	function Tick()
	{
		Tick._thisObjectList = [];
		Tick._callBackList = [];
		Tick._goRun = true;
		Tick._time = 0;
		Tick._countTime = 1;
		Tick._requestAnimationFrame = null;
		Tick._cancelAnimationFrame = null;
		Tick._requestAnimationId = null;
		Tick._count = 0;

		Tick._requestAnimationFrame = window["requestAnimationFrame"] ||
			window["webkitRequestAnimationFrame"] ||
			window["mozRequestAnimationFrame"] ||
			window["oRequestAnimationFrame"] ||
			window["msRequestAnimationFrame"];

		Tick._cancelAnimationFrame = window["cancelAnimationFrame"] ||
			window["msCancelAnimationFrame"] ||
			window["mozCancelAnimationFrame"] ||
			window["webkitCancelAnimationFrame"] ||
			window["oCancelAnimationFrame"] ||
			window["cancelRequestAnimationFrame"] ||
			window["msCancelRequestAnimationFrame"] ||
			window["mozCancelRequestAnimationFrame"] ||
			window["oCancelRequestAnimationFrame"] ||
			window["webkitCancelRequestAnimationFrame"];

		if (!Tick._requestAnimationFrame)
		{
			Tick._requestAnimationFrame = function (callback)
			{
				return window.setTimeout(callback, 1000 / 30);
			};
		}

		if (!Tick.cancelAnimationFrame)
		{
			Tick.cancelAnimationFrame = function (id)
			{
				return window.clearTimeout(id);
			};
		}
	}

	proto.enterFrame = function ()
	{
		if (!Tick._goRun)
		{
			return;
		}

		var thisTime = getTimer();
		var advancedTime = thisTime - Tick._time;
		Tick._requestAnimationId = Tick._requestAnimationFrame.call(window,Tick.prototype.enterFrame);

		if (Tick._count < Tick._countTime)
		{
			Tick._count++;
			return;
		}
		Tick._count = 0;
		Tick._callBackList.map(function (callBack, i)
		{
			callBack.call(Tick._thisObjectList[i], advancedTime);
		})
		Tick._time = thisTime;
	}

	proto.startTick = function ($callBack, $callTarget)
	{
		Tick._callBackList.push($callBack);
		Tick._thisObjectList.push($callTarget);

		if (Tick._callBackList.length == 1)
		{
			Tick._goRun = true;
			this.enterFrame();
		}
	}

	proto.stopTick = function ($callBack, $callTarget)
	{
		var index = Tick._callBackList.indexOf($callBack);
		if (index >= 0)
		{
			Tick._callBackList.splice(index, 1);
			Tick._thisObjectList.splice(index, 1);
		}

		if (Tick._callBackList.length == 0)
		{
			Tick._goRun = false;
		}
	}
	return Tick;
}());

export default Tick;