/**
 * Created by billy on 2019/4/24.
 */
var qs = require('querystring');

function response($res, $content)
{
	if (typeof $content == "string")
	{
		$res.writeHead(200, {"Content-Type": "text/html"});
	}
	else if (typeof $content == "number")
	{
		$content = JSON.stringify(formatResponse("", null, $content));
		$res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
	}
	else if (typeof $content == "object")
	{
		$content = JSON.stringify(formatResponse("", $content));
		$res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
	}
	if ($content)
	{
		$res.write($content, "utf8", function ()
		{
			$res.end();
		});
	}
	else
	{
		$res.end();
	}
}
exports.response = response;

function getPostData($request)
{
	var promise = new Promise((resolved, reject)=>
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

			resolved(query);
		});
	})

	return promise;
}
exports.getPostData = getPostData;