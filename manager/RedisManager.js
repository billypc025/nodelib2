/**
 * Created by billy on 2017/8/26.
 */
var g = require("../global");
var timeTool = require("../utils/TimeTool");
var Manager = require("./Manager");
var _module = require("../module/module");
var Redis = require("ioredis");

module.exports = class extends Manager {

	init()
	{
		this.managerType = "Redis";
		this.server = Redis.createClient({
			detect_buffers: true,
			host: this.param.host
		});
		this.server.auth(this.param.password);

		/*
		 this.server = new Redis(
		 {
		 port: this.param.port,                // Redis port
		 host: this.param.host,                // Redis host
		 password: this.param.password
		 });
		 this.logLimit = this.param.logLimit || 5000;

		 if (this.param.monitor)
		 {
		 this.logNum = 0;
		 this.log = "";
		 this.currLog = {
		 time: 0,
		 list: []
		 };

		 this.monitor = this.param.monitor;
		 this.server.monitor(($err, $monitor)=>
		 {
		 g.data.server.addServer(this.name, this.server);
		 $monitor.on('monitor', ($time, $args, $source, $database)=>
		 {
		 if ($args.indexOf("exec") == 0)
		 {
		 this.logNum++;
		 this.log += this.currLog.list.join(",");
		 this.currLog = {
		 time: 0,
		 list: []
		 };
		 if (this.logNum >= this.logLimit)
		 {
		 g.fs.writeFileSync(g.path.resolve(this.param.monitor) + "log_" + timeTool.getNowStamp() + ".txt", this.log);
		 this.logNum = 0;
		 this.log = "";
		 }
		 }
		 else
		 {
		 if ($time != this.currLog.time)
		 {
		 var t0 = $time - this.currLog.time
		 this.currLog.list.push(t0 + " " + $args.join(" "));
		 this.currLog.time = $time;
		 }
		 else
		 {
		 this.currLog.list.push($args.join(" "));
		 }
		 }
		 });
		 });
		 }
		 */
		super.init();
	}
}