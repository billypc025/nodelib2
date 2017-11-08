/**
 * Created by billy on 2017/5/13.
 */

var g = require("../global");
var http = require('http');
var url = require('url');
var qs = require('querystring');
var _module = require("../module/module");
var Manager = require("./Manager");
var cookie = require("node-cookie");
var types = {
	"css": "text/css",
	"gif": "image/gif",
	"html": "text/html",
	"ico": "image/x-icon",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"js": "text/javascript",
	"json": "application/json",
	"pdf": "application/pdf",
	"png": "image/png",
	"svg": "image/svg+xml",
	"swf": "application/x-shockwave-flash",
	"tiff": "image/tiff",
	"txt": "text/plain",
	"wav": "audio/x-wav",
	"wma": "audio/x-ms-wma",
	"wmv": "video/x-ms-wmv",
	"xml": "text/xml"
};

var _defaultPort = 8080;
var _header = {
	"Content-Type": "application/json;charset=utf-8",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Credentials": "true",
	'Access-Control-Allow-Methods': "PUT,POST,GET,DELETE,OPTIONS",
	"Access-Control-Allow-Headers": "X-Requested-With",
}
g.cookie = cookie;

module.exports = class extends Manager {

	init()
	{
		this.managerType = "Http";
		this.server = null;
		this.header = __merge(_header, this.param.header, true);
		this.port = this.param.port || _defaultPort;
		super.init();
	}

	start()
	{
		this.initServer();
		super.start();
	}

	initServer()
	{
		var server = http.createServer((request, response)=>
		{
			if (!this.param.hasOwnProperty("method")
				|| this.param.method == ""
				|| this.param.method == "*"
				|| this.param.method.tolowercase() == request.method.tolowercase())
			{
				var paramObj = url.parse(request.url);
				var func = this.getFunc(paramObj.pathname);
				doMethod[request.method](func, paramObj.pathname, request, response, this.header);
			}
		});

		server.listen(this.port);
		this.server = server;
		g.data.server.addServer("http:" + this.port, this.server);
		log.info(this.getMsg("Server runing at port:", this.port));
	}
}

var doMethod = {
	GET: function ($func, $pathName, $request, $response, $header)
	{
		let query = url.parse($request.url, true).query;
		doRequest($func, $pathName, query, $request, $response, $header);
	},
	POST: function ($func, $pathName, $request, $response, $header)
	{
		var postData = "";
		$request.addListener("data", function (data)
		{
			postData += data.toString();
		});
		$request.addListener("end", function ()
		{
			let query = qs.parse(postData);
			doRequest($func, $pathName, query, $request, $response, $header);
		});
	}
}

function doRequest($pathFunc, $pathName, $dataObj, $request, $response, $header)
{
	if ($pathFunc)
	{
		$pathFunc($dataObj,
			function ($resultObj, $headerObj, $responseType, $toFormat)
			{
				if (!$toFormat)
				{
					$resultObj = formatResponse($pathName, $resultObj);
				}
				writeOut(200, $resultObj, $request, $response, $headerObj, $responseType, $header);
			}, function ($errorObj, $headerObj, $toFormat)
			{
				if (!$toFormat)
				{
					$errorObj = formatResponse($pathName, null, $errorObj);
				}
				writeOut(200, $errorObj, $request, $response, $headerObj, "", $header);
			}, $request, $response);
	}
	else
	{
//		log._warn(this.getMsg("Not Found Func-", $pathName));
		writeOut(404, "", $request, $response);
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
//		$resultObj.on("data", (chunk) =>
//		{
//			trace(123123)
//			$response.write(chunk, "binary")
//		});
//		$resultObj.on("end", function ()
//		{
//			$response.end();
//		});

		let fileStream = g.fs.createReadStream($resultObj.data);
		fileStream.pipe($response);
	}
	else if ($responseType == "downloadBuff")
	{
		let fileStream = $resultObj.data;
		fileStream.pipe($response).on("finish", () => $response.end());
	}
	else
	{
		if ($status == 404)
		{
			$response.end();
		}
		else
		{
			$response.write(JSON.stringify($resultObj), "utf8", function ()
			{
				$response.end();
			});
		}
	}
}