var file = require("fs");
var mark = require("marked");
var CleanCSS = require("clean-css");
var path = require("path");

mark.setOptions({
	renderer: new mark.Renderer(),
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	smartypants: false
})

module.exports = function ($fileName, $targetName, $callBack)
{
	if (typeof $targetName == "function")
	{
		$callBack = $targetName;
		$targetName = "";
	}

	if ($fileName)
	{
		if ($fileName.indexOf(".md") == $fileName.length - 3)
		{
			$fileName = $fileName.substr(0, $fileName.length - 3);
		}

		if (!$targetName)
		{
			$targetName = $fileName;
		}

		if ($targetName.indexOf(".html") < 0)
		{
			$targetName += ".html";
		}

		var filePath = path.join("./", $fileName + ".md");
		if (file.existsSync(filePath))
		{
			var fileContent = file.readFileSync(filePath, {encoding: "utf8"});
			fileContent = mark(fileContent);
			fileContent = getHtml(fileContent, $fileName);
			file.writeFile(path.join("./", $targetName), fileContent, {encoding: "utf8"}, $callBack);
		}
		else
		{
			$callBack("指定的文件不存在：" + filePath);
		}
	}
	else
	{
		$callBack("没有指定要转换的md文件！");
	}
}

function getHtml($bodyHtml, $title)
{
	$title = $title || "";
	var html = "";
	html += "<!doctype html><html lang='en'><head><meta charset='utf-8'>";
	html += "<meta name='viewport' content='width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0'>";
	html += "<title>" + $title + "</title>";
	html += getStyle();
	html += "</head><body class='container'><div class='file-content wiki'>"
	html += $bodyHtml;
	html += "</div></body></html>";
	return html;
}

function getStyle()
{
	var currPath = __dirname;
	var cssFile = file.readFileSync(currPath + "\\" + "mark.css", {encoding: "utf8"});
	cssFile = new CleanCSS({}).minify(cssFile).styles;
	var html = "<style>";
	html += cssFile;
	html += "</style>"
	return html;
}