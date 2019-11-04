/**
 * Created by billy on 2019/11/4.
 */
//var Url = require("url");
var querystring = require("querystring");

var _protocolHash = {
	"http:": require("http"),
	"https:": require("https")
}
var _methodHash = {
	get: callGet,
	post: callPost
}

var _cookiePool = {};

global.$.call = function ($param, ...arg)
{
	var url = "", data = {}, method = "get", headers;
	if (typeof $param == "object")
	{
		url = $param.url;
		data = $param.url || data;
		method = $param.method || method;
		headers = $param.headers;
	}
	else if (typeof $param == "string")
	{
		url = $param;
		if (arg.length > 0)
		{
			if (typeof arg[0] == "object")
			{
				data = arg[0] || data;
				method = arg[1] || method;
			}
			else
			{
				method = arg[0] || method;
			}
		}
	}

	headers = headers || {"Content-Type": "application/json"};

	if (!_methodHash[method])
	{
		return;
	}

	try
	{
		url = new URL(url);
	}
	catch (e)
	{
		return;
	}

	var protocol = url.protocol;
	if (!_protocolHash[protocol])
	{
		return;
	}

	var cookie = _cookiePool[url.origin];
	if (cookie)
	{
		headers.cookie = cookie;
	}

	return _methodHash[method](_protocolHash[protocol], url, data, headers);
}

function callPost($req, $url, $data, $headers)
{
	var promise = new Promise((resolved, reject) =>
	{
		var netObj = {
			host: $url.hostname,
			path: $url.pathname,
			method: "POST",
			headers: $headers
		}

		if ($url.port)
		{
			netObj.port = $url.port - 0;
		}

		var queryString = $url.searchParams.toString();
		if (queryString)
		{
			var queryObj = querystring.decode(queryString);
			$data = __merge($data, queryObj);
		}

		var _req = $req.request(netObj, (req, res) =>
			{
				for (var k in req.headers)
				{
					if (k.toLowerCase().indexOf("cookie") >= 0)
					{
						_cookiePool[$url.origin] = req.headers[k];
						break;
					}
				}

				var returnData = "";
				req.on('data', (data) =>
				{
					returnData += data;
				});
				req.on('end', () =>
				{
					try
					{
						returnData = JSON.parse(returnData);
					}
					catch (e)
					{
					}
					resolved(returnData);
				});
			}
		);

		if (Object.keys($data).length > 0)
		{
			_req.write(JSON.stringify($data));
		}
		_req.end();
	})

	return promise;
}

function callGet($req, $url, $data, $headers)
{
	var promise = new Promise((resolved, reject) =>
	{
		for (var k in $data)
		{
			$url.searchParams.set(k, data[k]);
		}
		$req.get($url.href, {headers: $headers}, (req, res) =>
		{
			for (var k in req.headers)
			{
				if (k.toLowerCase().indexOf("cookie") >= 0)
				{
					_cookiePool[$url.origin] = req.headers[k];
					break;
				}
			}

			var returnData = "";
			req.on('data', (data) =>
			{
				returnData += data;
			});
			req.on('end', () =>
			{
				try
				{
					returnData = JSON.parse(returnData);
				}
				catch (e)
				{
				}
				resolved(returnData);
			});
			req.on('error', (d) =>
			{
				reject(d)
			})
		});
	})

	return promise;
}