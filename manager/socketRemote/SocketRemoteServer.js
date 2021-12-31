/**
 * Created by billy on 2019/12/4.
 */
/*
 {
 "name": "$请输入服务名称",
 "type": "socket",
 "param": {
 "port": 8002,
 "path": "/test",
 "serveClient": false,
 "pingInterval": 10000,
 "pingTimeout": 5000,
 "cookie": false,
 "transports": [
 "websocket",
 "polling"
 ],
 "requireLogin": {
 "timeout": 5000,
 "module": "/test/login"
 },
 "redis": {
 "port": 6379,
 "host": "127.0.0.1"
 }
 },
 "module": {
 "/test": "./module/test"
 },
 "enabled": true
 }
 */
var url = require("url");
var qs = require("querystring");
var http = require("http");
var socket_io = require("socket.io");
var Emitter = require('events').EventEmitter;

var _methodHash = {
	"GET": method_get,
	"POST": method_post
}

class SocketRemoteServer {
	constructor($param)
	{
		this.reqId = 0;
		this.reqHash = {};
		this.param = $param;
		this.connected = false;
		this.emiter = new Emitter();
		this.init();
	}

	init()
	{
		this.server = http.createServer();
		this.io = socket_io(this.server);
		this.io.on("connection", client =>
		{
			if (this.client)
			{
				return;
			}
			this.client = client;
			this.connected = true;
			trace("connected:", this.connected);
			client.onevent = (data) =>
			{
				var returnData = data.data;
				this.emiter.emit(returnData[0], JSON.parse(returnData[1]));
			};
			client.on("disconnect", () =>
			{
				this.connected = false;
				this.client = null;
				this.emiter.emit("disconnect");
			});
		});
		this.server.listen(this.param.port);
	}

	async request($method, $router, $pathName, $request, $response, $header)
	{
		var queryObj = await _methodHash[$method]($request);
		var requestObj = {
			data: queryObj,
			router: $router,
			pathName: $pathName,
			request: $request,
			response: $response,
			header: $header
		}
		var data = await this.send(requestObj)
		var reqId = data.requestId;
		var reqObj = this.reqHash[reqId];
		var status = data.status;
		var result = data.result;
		writeOut(status, result, reqObj.request, reqObj.response, data.header, data.responseType, reqObj.header);
		return;
	}

	send($param)
	{
		return _promise((resolved)=>
		{
			this.reqId++;
			this.reqHash[this.reqId] = $param;
			$param.requestId = this.reqId;
			this.emiter.once("request_" + this.reqId, ($data)=>
			{
				resolved($data);
			})
			var sendData = {
				requestId: $param.requestId,
				data: $param.data,
				router: $param.router,
				pathName: $param.pathName
			}
			this.client.emit("data", sendData);
		})
	}
}

SocketRemoteServer.constructor.name = "SocketRemoteServer";
module.exports = SocketRemoteServer;

function method_get($request)
{
	return _promise((resolved)=>
	{
		let query = url.parse($request.url, true).query;
		$request.requestData = query;
		resolved(query);
	})
}

function method_post($request)
{
	return _promise((resolved)=>
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
			resolved(query);
		});
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