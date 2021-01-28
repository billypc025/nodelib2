/**
 * Created by billy on 2021/1/12.
 */

module.exports = async function ($exeFunc, $targetList, $multiNum, $param = {})
{
	var _timeList = []
	var promiseList = [];
	if ($targetList.length == 0)
	{
		return $targetList;
	}
	var targetList = $targetList.concat();
	var totalNum = targetList.length;
	var startTime = Date.now();
	while (targetList.length > 0)
	{
		var avg = Math.ceil(targetList.length / $multiNum);
		var tempList = targetList.splice(0, Math.min(avg, targetList.length));
		var infoObj = {
			curr: 0,
			total: tempList.length,
			...$param
		};
		_timeList.push(infoObj);
//		promiseList.push($exeFunc(infoObj, tempList));
		promiseList.push((async($infoObj, $list)=>
		{
			var resultList = [];
			for (var itemObj of $list)
			{
				var resultObj = await $exeFunc(itemObj);
				resultList.push(resultObj);
				$infoObj.curr++;
			}
			return resultList;
		})(infoObj, tempList));
		$multiNum--;
	}

	if ($param.trace != false)
	{
		var initSpeed = "";
		var interval = setInterval(()=>
		{
			var curr = 0;
			if (_timeList.length == 1)
			{
				curr = _timeList[0].curr;
			}
			else
			{
				curr = _timeList.reduce((a, b)=>isNum(a) ? a + b.curr : a.curr + b.curr);
			}
			var pastTime = Date.now() - startTime;
			var speed = curr / pastTime * 1000; // 个/s
			if (!initSpeed)
			{
				initSpeed = speed / 3;
			}
			speed = initSpeed + (speed - initSpeed) / 20;
			initSpeed = speed;
			var restTime = g.time.formatTime(Math.ceil((totalNum - curr) / speed), "hh:mm:ss");
			console.loading(`Speed: ${speed.toFixed(2)}/s  RestTime:${restTime} (${curr} / ${totalNum})`, curr / totalNum * 100);
		}, 100);
	}

	var promiseResultList = await Promise.all(promiseList);
	if ($param.trace != false)
	{
		console.loading("", 100);
	}
	var resultList = [];
	for (var resultItem of promiseResultList)
	{
		if (resultItem)
		{
			resultList = resultList.concat(resultItem);
		}
	}
	return resultList;
}

function __setTimeout(callback, time)
{
	return _promise(r=>
	{
		setTimeout(()=>
		{
			callback();
			r();
		}, time)
	})
}