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

global.$.request = function ($param, ...arg) {
	var url, data, method, headers;
	if (typeof $param == "object") {
		url = $param.url;
		data = $param.data;
		method = $param.method;
		headers = $param.headers;
	} else if (typeof $param == "string") {
		url = $param;
		if (arg.length > 0) {
			if (typeof arg[0] == "object") {
				data = arg[0];
				method = arg[1];
			} else {
				method = arg[0];
			}
		}
	}

	return doRequest(url, data, method, headers);
}

global.$.get = function ($param, $data, $headers, $options = {}) {
	var url, data, headers;
	if (typeof $param == "object") {
		url = $param.url;
		data = $param.data;
		headers = $param.headers;
	} else if (typeof $param == "string") {
		url = $param;
		if ($data && typeof $data == "object") {
			data = $data;
			headers = $headers;
		}
	}
	return doRequest(url, data, "get", headers, $options);
}

global.$.post = function ($param, $data, $headers, $options = {}) {
	var url, data, headers;
	if (typeof $param == "object") {
		url = $param.url;
		data = $param.data;
		headers = $param.headers;
	} else if (typeof $param == "string") {
		url = $param;
		if ($data && typeof $data == "object") {
			data = $data;
			headers = $headers;
		}
	}
	return doRequest(url, data, "post", headers, $options);
}

function doRequest($url, $data, $method, $headers, $options = {}) {
	var url = $url,
		data = $data,
		method = $method,
		headers = $headers,
		options = $options;

	method = method || "get";
	data = data || {};
	headers = headers || {
		"Content-Type": "application/json; charset=UTF-8"
	};
	var kList = Object.keys(headers);
	var contentTypeIndex = kList.findIndex(v => v.toLowerCase() == "content-type");
	if (contentTypeIndex < 0) {
		headers["Content-Type"] = "application/json; charset=UTF-8";
	} else if (!headers["Content-Type"]) {
		var contentType = headers[kList[contentTypeIndex]];
		delete headers[kList[contentTypeIndex]];
		headers["Content-Type"] = contentType;
	}

	if (!url || typeof url != "string") {
		return;
	}

	if (!_methodHash[method]) {
		return;
	}

	try {
		url = new URL(url);
	} catch (e) {
		return;
	}

	var protocol = url.protocol;
	if (!_protocolHash[protocol]) {
		return;
	}

	var cookie = _cookiePool[url.origin];
	if (cookie) {
		headers.cookie = cookie;
	}

	return _methodHash[method](_protocolHash[protocol], url, data, headers, options);
}

function callPost($req, $url, $data, $headers, $options) {
	var promise = new Promise((resolved, reject) => {
		var headers = {
			...$headers
		}
		var queryString = $url.searchParams.toString();
		if (queryString) {
			var queryObj = querystring.decode(queryString);
			$data = __merge($data, queryObj);
		}

		var postData = querystring.stringify($data);

		var contentType = headers["Content-Type"];

		if (contentType.indexOf("application/x-www-form-urlencoded") >= 0) {
			if (typeof $data == "object") {
				if (Object.keys($data).length > 0) {
					postData = querystring.stringify($data);
				}
			} else {
				$data += "";
				if ($data.length > 0) {
					postData = $data;
				}
			}
		} else if (contentType.indexOf("application/json") >= 0) {
			if (typeof $data == "object") {
				if (Object.keys($data).length > 0) {
					postData = JSON.stringify($data);
				}
			} else {
				$data += "";
				if ($data.length > 0) {
					postData = $data;
				}
			}
		}

		if (postData.length > 0) {
			headers["Content-Length"] = Buffer.byteLength(postData);
		}

		var netObj = {
			host: $url.hostname,
			path: $url.pathname + $url.search,
			method: "POST",
			headers: headers
		}

		if ($url.port) {
			netObj.port = $url.port - 0;
		}

		var _req = $req.request(netObj, (req, res) => {
			for (var k in req.headers) {
				if (k.toLowerCase().indexOf("cookie") >= 0) {
					_cookiePool[$url.origin] = req.headers[k];
					break;
				}
			}

			var returnData = "";
			req.on("data", (data) => {
				returnData += data;
			});
			req.on("end", () => {
				try {
					returnData = JSON.parse(returnData);
				} catch (e) {}
				resolved(returnData);
			});
		});
		_req.on("error", (e) => {
			reject(e);
		});

		if (postData.length > 0) {
			_req.write(postData);
		}
		_req.end();
	})

	return promise;
}

function callGet($req, $url, $data, $headers, $options) {
	var promise = new Promise((resolved, reject) => {
		for (var k in $data) {
			$url.searchParams.set(k, $data[k]);
		}
		var _req = $req.get($url.href, {
			headers: $headers
		}, (res) => {
			for (var k in res.headers) {
				if (k.toLowerCase().indexOf("cookie") >= 0) {
					_cookiePool[$url.origin] = res.headers[k];
					break;
				}
			}

			var contentTypeStr = res.headers["content-type"] || "";
			var contentType = "text"
			if (contentTypeStr.indexOf("image/") == 0) {
				contentType = "image";
			}
			var returnData = "";
			var index = 0;
			res.on("data", (data) => {
				if (contentType == "image") {
					var contentLength = res.headers["content-length"] || "";
					contentLength -= 0;
					if (data instanceof Uint8Array) {
						if (typeof returnData == "string") {
							returnData = Buffer.alloc(contentLength);
						}
						returnData.fill(data, index, index + data.length)
						index += data.length;
					} else {
						returnData += data;
					}
				} else {
					returnData += data;
				}
			});
			res.on("end", () => {
				if (typeof returnData == "string") {
					try {
						returnData = JSON.parse(returnData);
					} catch (e) {}
				}
				if ($options && $options.all) {
					resolved({
						res: res,
						req: res,
						data: returnData
					});
				} else {
					resolved(returnData);
				}
			});
		});
		_req.on("error", (e) => {
			trace(e)
			reject(e);
		})
	})

	return promise;
}