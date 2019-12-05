/**
 * Created by billy on 2019/12/4.
 */
var io = require("socket.io-client");

class SocketRemoteClient {
	constructor($param, $httpManager)
	{
		this.httpManager = $httpManager;
		this.reqId = 0;
		this.reqHash = {};
		this.param = $param;
		this.connected = false;
		this.init();
	}

	init()
	{
		this.client = io(this.param.url, {transports: ["websocket", "polling"]});
		this.client.on("connect", (socket) =>
		{
			trace("SocketRemoter connect!")
		});
		this.client.on("data", ($data)=>
		{
			var requestId = $data.requestId;
			var data = $data.data;
			var router = $data.router;
			var pathName = $data.pathName;
			var func = this.httpManager.getFunc(pathName);
			doRequest(router, func, pathName, data, {headers: {cookie: ""}}, {}).then(($data)=>
			{
				var dataObj = {
					requestId: requestId,
					status: $data.status,
					result: $data.result,
					header: $data.header,
					responseType: $data.responseType,
					noFormat: $data.noFormat
				};
				dataObj = JSON.stringify(dataObj);
				this.client.emit("request_" + requestId, dataObj);
			});
		});
	}
}

SocketRemoteClient.constructor.name = "SocketRemoteClient";
module.exports = SocketRemoteClient;

function doRequest($router, $pathFunc, $pathName, $dataObj, $request, $response, $header)
{
	return _promise((resolved)=>
	{
		if ($pathFunc)
		{
			$pathFunc($dataObj,
				function ($resultObj, $headerObj, $responseType, $noFormat)
				{
					if ($responseType == "template")
					{
						$resultObj = __merge($resultObj || {}, {host: $request.headers.host || ""})
						var content = g.data.file.get("/template").get($headerObj, $resultObj);
						if (content)
						{
							resolved({
								status: 200,
								result: content,
								header: {"Content-Type": "text/html"},
								responseType: "text"
							});
						}
					}
					else
					{
						if (!$noFormat)
						{
							$resultObj = formatResponse($pathName, $resultObj);
						}
						resolved({
							status: 200,
							result: $resultObj,
							header: $headerObj,
							responseType: $responseType
						});
					}
				}, function ($errorObj, $headerObj, $noFormat)
				{
					if (!$noFormat)
					{
						$errorObj = formatResponse($pathName, null, $errorObj);
					}
					resolved({
						status: 200,
						result: $errorObj,
						header: "",
						responseType: $responseType
					});
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
						resolved({
							status: 200,
							result: content,
							header: {"Content-Type": "text/html"},
							responseType: "text"
						});
					}
				}
			}
			else
			{
//		log._warn(this.getMsg("Not Found Func-", $pathName));
				writeOut(404, "", $request, $response);
				resolved({
					status: 404,
					result: "",
					header: null,
					responseType: null
				});
			}
		}
	})
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