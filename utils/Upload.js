/**
 * Created by billy on 2017/11/9.
 */
var OSSClient = require("./upload/oss");
var COSClient = require("./upload/cos");
var LocalClient = require("./upload/local");

var _freeHash = {};

class UpFileLoader {
	constructor($param, $type)
	{
		this.param = $param;
		this.type = $type;
	}

	upload($path, $targetPath)
	{
		return this.getClient().upload($path, $targetPath);
	}

	del($fileName)
	{
		return this.getClient().del($fileName);
	}

	getClient()
	{
		return getClient(this.param, this.type);
	}
}

function getClient($param, $type = "oss")
{
	var freeList = _freeHash[$type];
	if (!freeList)
	{
		freeList = [];
		_freeHash[$type] = freeList;
	}

	if (freeList.length > 0)
	{
		var client = freeList.shift();
		if (client.param != $param)
		{
			client.update($param);
		}
		client.param = $param;
		return client;
	}

	return createClient($param, $type);
}

function createClient($param, $type)
{
	var client;
	if ($type == "oss") //阿里云
	{
		client = new OSSClient($param);
	}
	else if ($type == "cos") //腾讯云
	{

	}
	else if ($type == "local") //上传在服务器本地目录
	{

	}
	client.type = $type;

	client.on("COMPLETE", ($client)=>
	{
		_freeHash[$client.type].push($client);
	})
	return client;
}

module.exports = UpFileLoader;