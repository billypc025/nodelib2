/**
 * Created by billy on 2017/11/9.
 */
var fs = require("fs");
var EventEmitter = require("events").EventEmitter;
var co = require("co");
var OSS = require("ali-oss");
var g = require("nodeLib");
var _timeTool = require("../TimeTool");

class OSSClient extends EventEmitter {
	constructor($param)
	{
		super();
		this.client = null;
		this.update($param);
	}

	update($param)
	{
		if (this.client == null)
		{
			this.client = new OSS($param);
		}
		else
		{
			this.client.options = OSS.initOptions($param);
		}
	}

	/**
	 * 将指定的文件上传到oss指定目录
	 * @param $path 要上传的文件路径（原始文件路径）
	 * @param $targetPath oss目标路径（要上传到的目标位置）
	 * @returns {Promise}
	 */
	upload($path, $targetPath)
	{
		var promiseList = [];
		//	$path = "./assets/publish/201711";
		if (!fs.existsSync($path))
		{
			return error("noFile");
		}
		if (g.file.isDirectory($path)) //判断是否是文件夹
		{
			var list = g.file.getDirectoryAllListing($path);
			for (i = 0; i < list.length; i++)
			{
				var targetPath = list[i].replace($path, "")
				if ($targetPath)
				{
					targetPath = g.path.join($targetPath, targetPath);
				}

				promiseList.push(doUpload(this.client, list[i], targetPath));
			}
		}
		else
		{
			if (g.path.parse($targetPath).ext == "") //支持目标路径是一个目录
			{
				if ($targetPath.charAt($targetPath.length - 1) != "/")
				{
					$targetPath += "/";
				}
				$targetPath = $targetPath + g.path.parse($path).base
			}

			promiseList.push(doUpload(this.client, $targetPath, $path));
		}

		return Promise.all(promiseList).then(()=>
		{
			this.emit("COMPLETE", this);
		})
	}

	delete($url)
	{
		var promiseList = [];
		if (typeof $url == "string")
		{
			promiseList.push(doDelete(this.client, $url));
		}
		else
		{
			for (var url of $url)
			{
				promiseList.push(doDelete(this.client, url));
			}
		}
		return Promise.all(promiseList).then(()=>
		{
			this.emit("COMPLETE", this);
		})
	}
}

function doUpload($client, $path, $targetPath)
{
	let client = $client;
	var promise = new Promise((resolved, reject)=>
	{
		co(function*()
		{
			var result = yield client.put($path, $targetPath);
			resolved();
		}).catch(function (err)
		{
			log.error(err);
		});
	})

	return promise;
}

function doDelete($client, $url)
{
	let client = $client;
	var promise = new Promise((resolved, reject)=>
	{
//		var targetPath = _param.basePath + $fileName;
		co(function*()
		{
			var result = yield client.delete($fileName);
			resolved();
		}).catch(function (err)
		{
		});
	});

	return promise;
}

function error($error)
{
	if (eval("error_" + $error))
	{
		return {then: eval("error_" + $error)};
	}
	return {
		then: ($cb)=>
		{
			$cb && $cb("error");
		}
	}
}

function error_noFile($callback)
{
	if ($callback)
	{
		$callback({
			code: 99999,
			msg: "file not exist!"
		});
	}
}

module.exports = OSSClient;