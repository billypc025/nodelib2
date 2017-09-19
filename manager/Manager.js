/**
 * Created by billy on 2017/8/24.
 */
var g = require("../global");
var _module = require("../module/module");

module.exports = class {
	constructor($managerData)
	{
		this.managerType = "";
		this.funcHash = {};
		this._data = $managerData;
		$managerData.update({manager: this});
	}

	preStart($callBack)
	{
		this._callBack = $callBack;
		this.init();
	}

	init()
	{
		this.initModule();
		this.start();
	}

	initModule()
	{
		for (var routerPath in this.module)
		{
			var modulePath = this.module[routerPath];
			var moduleClass = require(g.path.join(global.projPath || "", modulePath));
			var moduleItem = _module.addModule(routerPath, moduleClass, this.data);

			this.funcHash = __merge(this.funcHash, moduleItem.funcHash);
		}
	}

	start($success)
	{
		if ($success == undefined)
		{
			$success = true;
		}
		else
		{
			$success = false;
		}

		this._callBack && this._callBack(this._name, $success);
	}

	getFunc($pathName)
	{
		return this.funcHash[$pathName];
	}

	get data()
	{
		return this._data;
	}

	get name()
	{
		return this.data.name;
	}

	get type()
	{
		return this.data.type;
	}

	get param()
	{
		return this.data.param;
	}

	get module()
	{
		return this.data.module;
	}

	getMsg(...arg)
	{
		return "[" + this.managerType + "] " + this.name + ": " + arg.join(" ");
	}
}