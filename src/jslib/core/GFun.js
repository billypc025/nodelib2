var TIME_FORMAT;
(function (TIME_FORMAT)
{
	TIME_FORMAT[TIME_FORMAT["dhms"] = 0] = "dhms";
	TIME_FORMAT[TIME_FORMAT["hms"] = 1] = "hms";
	TIME_FORMAT[TIME_FORMAT["dhms_colon"] = 2] = "dhms_colon";
	TIME_FORMAT[TIME_FORMAT["hms_colon"] = 3] = "hms_colon";
	TIME_FORMAT[TIME_FORMAT["ms_colon"] = 4] = "ms_colon";
})(TIME_FORMAT || (TIME_FORMAT = {}));
var GFun;
(function (GFun)
{
	GFun.raiseFunc; //飘字功能
	/**格式化数字 num支持数字和文本
	 */
	function formatNum(num)
	{
		if (Math.abs(num) >= 100000000)
		{
			num = int(Math.floor(num / 100000000));
			return num + "亿";
		}
		else if (Math.abs(num) >= 100000)
		{
			num = int(Math.floor(num / 1000) / 10);
			return num + "万";
		}
		return num + "";
	}

	GFun.formatNum = formatNum;
	/**格式化时间
	 */
	function formatTime(t, $timeType, $unitList)
	{
		if ($timeType === void 0)
		{
			$timeType = 0 /* dhms */;
		}
		if ($unitList === void 0)
		{
			$unitList = ["d", "h", "m", "s"];
		}
		var str = "";
		var timeType;
		if ($timeType < 2)
		{
			if ($timeType == 0 /* dhms */)
			{
				timeType = TimeTool.TYPE_DHMS;
			}
			else if ($timeType == 1 /* hms */)
			{
				timeType = TimeTool.TYPE_HMS;
			}
			var arr = TimeTool.getCountDown(Math.max(t, 0), timeType);
			if (arr[0] > 0)
			{
				str += arr[0] + $unitList[0];
			}
			if (arr[1] > 0)
			{
				str += arr[1] + $unitList[1];
			}
			if (arr[2] > 0)
			{
				str += arr[2] + $unitList[2];
			}
			if (arr[0] == 0 && arr[1] == 0 && arr.length > 3 && arr[3] != 0)
			{
				str += arr[3] + $unitList[3];
			}
			if (str == "")
			{
				str = "0" + $unitList[$unitList.length - 1];
			}
		}
		else
		{
			if ($timeType == 2 /* dhms_colon */)
			{
				timeType = TimeTool.TYPE_DHMS;
			}
			if ($timeType == 3 /* hms_colon */)
			{
				timeType = TimeTool.TYPE_HMS;
			}
			if ($timeType == 4 /* ms_colon */)
			{
				timeType = TimeTool.TYPE_MS;
			}
			str = TimeTool.formatTime(Math.max(t, 0), timeType);
		}
		return str;
	}

	GFun.formatTime = formatTime;
	/**格式化html文本
	 */
	function formatHtml(str)
	{
		return HtmlTool.format(str);
	}

	GFun.formatHtml = formatHtml;
	function showMsg(msg, yesFun, noFun, targetObj)
	{
		GModule.call("Sys", "update", "notice", msg, yesFun, noFun, targetObj);
	}

	GFun.showMsg = showMsg;
	function removeMsg()
	{
		GModule.call("Sys", "update", "removeDotPrompt");
	}

	GFun.removeMsg = removeMsg;
	//切换场景
	function changeScene(sceneName, param, updateList, changeAnim, msg)
	{
		if (param === void 0)
		{
			param = null;
		}
		if (updateList === void 0)
		{
			updateList = null;
		}
		if (changeAnim === void 0)
		{
			changeAnim = true;
		}
		if (msg === void 0)
		{
			msg = "";
		}
		GModule.call("Sys", "update", "changeScene", sceneName, param, updateList, changeAnim, msg);
	}

	GFun.changeScene = changeScene;
	function matchLength(msg)
	{
		var regx = /[^\x00-\xff]/g;
		return msg.replace(regx, "**").length;
	}

	GFun.matchLength = matchLength;
	/**
	 * 禁止按钮点击n毫秒
	 * @param dObj 按钮显示对象
	 * @param timeout 时间（毫秒）
	 */
	function disableBtnByTime(dObj, timeout)
	{
		if (timeout === void 0)
		{
			timeout = 1000;
		}
		dObj.touchEnabled = false;
		setTimeout(function ()
		{
			dObj.touchEnabled = true;
		}, timeout);
	}

	GFun.disableBtnByTime = disableBtnByTime;
	function getNumAt(num, bit)
	{
		return num >> (bit - 1) & 1;
	}

	GFun.getNumAt = getNumAt;
	function setNumAt(num, bit)
	{
		return num | (1 << (bit - 1));
	}

	GFun.setNumAt = setNumAt;
	function reload()
	{
		window.top.location.reload();
	}

	GFun.reload = reload;
	/** 分享
	 * @param content 文本内容
	 * @param shareType 分享平台（默认新浪微博xlwb）
	 */
	function share(content, shareType)
	{
		if (shareType === void 0)
		{
			shareType = "xlwb";
		}
		//webVars.page["doShare"](content, shareType);
		window["doShare"](content, shareType);
	}

	GFun.share = share;
	function checkStrLen(str)
	{
		var len = 0;
		for (var i = 0; i < str.length; i++)
		{
			if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94)
			{
				len += 2;
			}
			else
			{
				len++;
			}
		}
		return len;
	}

	GFun.checkStrLen = checkStrLen;
	function md5(str)
	{
		return MD5.inc().hex_md5(str);
	}

	GFun.md5 = md5;
	GFun.raiseFunc = new RaiseFunc();
})(GFun || (GFun = {}));
