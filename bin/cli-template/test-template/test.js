//用于加入一条提示信息
addMsg("提示信息")

//用于加入一个接口测试
addTest("user/login", {
	account: "18658110520",
	$pass: ["11223344", "1235234", ""]
}, function (d)
{
	trace(d)
	this.end(); //用例结束必须调用这个方法
});