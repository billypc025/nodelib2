/**
 * Created by billy on 2019/12/5.
 */
var url = require('url');
var qs = require('querystring');

var _methodHash = {
	GET: method_get,
	POST: method_post,
	OPTIONS: function ($router, $func, $pathName, $request, $response, $header)
	{
		$response.statusCode = 204;
		writeOut(204, "", $request, $response, {
			"Content-Type": "application/json;charset=utf-8",
			"Access-Control-Allow-Headers": "X-Requested-With,content-type"
		}, "", $header);
	}
}

function getData($request)
{
	var method = $request.method.toUpperCase();
	if (_methodHash[method])
	{
		return _methodHash[method]($request);
	}
	else
	{
		return _promise(resolved=>resolved({code: 404}));
	}
}
exports.getData = getData;

function method_get($request)
{
	return _promise((resolved)=>
	{
		let query = url.parse($request.url, true).query;
		$request.requestData = query;
		resolved({
			code: 200,
			data: query
		});
	})
}

function method_post($request)
{
	var paramObj = url.parse($request.url);
	var pathname = paramObj.pathname;
	return _promise((resolved)=>
	{
		if (pathname && pathname.indexOf("/upload") > 0)
		{
			let query = url.parse($request.url, true).query;
			resolved(query);
		}
		else
		{
			var postData = "";
			$request.addListener("data", function (data)
			{
				postData += data.toString();
			});
			$request.addListener("end", function ()
			{
				let query;
				if ((postData.charAt(0) == "{" && postData.charAt(postData.length - 1) == "}")
					|| (postData.charAt(0) == "[" && postData.charAt(postData.length - 1) == "]"))
				{
					try
					{
						query = JSON.parse(postData);
					}
					catch (e)
					{
						query = qs.parse(postData);
					}
				}
				else
				{
					query = qs.parse(postData);
				}
				$request.requestData = query;
				resolved({
					code: 200,
					data: query
				});
			});
		}
	})
}

function method_options($request, $response)
{
	return _promise((resolved)=>
	{
		$response.statusCode = 204;
		resolved({code: 204});
	})
}

function doRequest($router, $pathFunc, $pathName, $dataObj, $request, $response, $header)
{
	if ($pathFunc)
	{
		formatDataObj($dataObj);
		$pathFunc($dataObj,
			function ($resultObj, $headerObj, $responseType, $noFormat)
			{
				if ($responseType == "template")
				{
					$resultObj = __merge($resultObj || {}, {host: $request.headers.host || ""})
					var content = g.data.file.get("/template").get($headerObj, $resultObj);
					if (content)
					{
						writeOut(200, content, $request, $response, {"Content-Type": "text/html"}, "text", $header);
					}
				}
				else
				{
					if (!$noFormat)
					{
						$resultObj = formatResponse($pathName, $resultObj);
					}
					writeOut(200, $resultObj, $request, $response, $headerObj, $responseType, $header);
				}
			}, function ($errorObj, $headerObj, $noFormat)
			{
				if (!$noFormat)
				{
					$errorObj = formatResponse($pathName, null, $errorObj);
				}
				writeOut(200, $errorObj, $request, $response, $headerObj, "", $header);
			}, $request, $response);
	}
	else
	{
		if ($router && $router[$pathName])
		{
			var path = $router[$pathName];
			var fileType = getFileType(path);
			if (fileType != "none")
			{
				var content = g.data.file.get("/template").get(path, {host: $request.headers.host || ""});
				if (content)
				{
					writeOut(200, content, $request, $response, {"Content-Type": "text/html"}, "text", $header);
				}
			}
		}
		else
		{
//		log._warn(this.getMsg("Not Found Func-", $pathName));
			writeOut(404, "", $request, $response);
		}
	}
}

function writeOut($status, $resultObj, $request, $response, $headerObj, $responseType, $header)
{
	var header = __merge({}, $header, true);
	header = __merge(header, $headerObj, true);
	if (header["Access-Control-Allow-Origin"] && header["Access-Control-Allow-Origin"] == "{origin}")
	{
		header["Access-Control-Allow-Origin"] = $request.headers.origin || "*";
	}

	$response.writeHead($status, header);
	if ($responseType == "download")
	{
		let fileStream = g.fs.createReadStream($resultObj.data);
		fileStream.pipe($response);
	}
	else if ($responseType == "downloadBuff")
	{
		let fileStream = $resultObj.data;
		fileStream.pipe($response).on("finish", () => $response.end());
	}
	else if ($responseType == "text")
	{
		$response.write($resultObj, "utf8", function ()
		{
			$response.end();
		});
	}
	else
	{
		if ($status == 404)
		{
			$response.end();
		}
		else
		{
			if ($resultObj)
			{
				$response.write(JSON.stringify($resultObj), "utf8", function ()
				{
					$response.end();
				});
			}
			else
			{
				$response.end();
			}
		}
	}
}

function formatDataObj($dataObj)
{
	for (var k in $dataObj)
	{
		var val = $dataObj[k];
		if (typeof val == "string" && val.length < 11)
		{
			if (isNum(val))
			{
				$dataObj[k] = val - 0;
			}
		}
	}
}