/**
 * Created by billy on 2016/12/17.
 */
import Vue from "vue";
import VueRouter from "vue-router";
import VueResource from "vue-resource";
import * as GCore from "./GCore";
import * as GDirective from "./GDirective";

var el;
var vm;
export var routerHash = Object.create(null); //路由hash表
var _reqHash = Object.create(null);
var $router; //vue的router
var router; //RouterClient
var _hookIdList = [];
var _hookHash = Object.create(null);

Vue.config.productionTip = false;

defineProperty(exports, "vm", ()=>
{
	return vm;
})

defineProperty(exports, "el", ()=>
{
	return el;
})

export {Vue};

export function init($el, $routerList, $params)
{
	el = $el;
	$router = $routerList;
	for (var item of $router)
	{
		routerHash[item.path] = item;
	}
	Vue.use(VueRouter);
	Vue.use(VueResource);
	Vue.config.devtools = true;
	Vue.http.options.emulateJSON = true;

	$router = new VueRouter({
		mode: 'hash',
		base: "/",
		routes: $router
	});

	router = new RouterClient($router);

	if ($params)
	{
		if ($params.hasOwnProperty("plugin"))
		{
			if (Array.isArray($params.plugin))
			{
				for (var plugin of $params.plugin)
				{
					if (Array.isArray(plugin))
					{
						Vue.use.apply(Vue.use, plugin);
					}
					else
					{
						Vue.use(plugin);
					}
				}
			}
			else
			{
				Vue.use($params.plugin);
			}
		}

		if ($params.hasOwnProperty("plugins") && Array.isArray($params.plugins))
		{
			for (var plugin of $params.plugins)
			{
				Vue.use(plugin);
			}
		}

		if ($params.hasOwnProperty("config"))
		{
			for (var k in $params.config)
			{
				Vue.config[k] = $params.config[k];
			}
		}

		if ($params.hasOwnProperty("directive"))
		{
			GDirective.init(Vue, $params.directive);
		}

		if ($params.hasOwnProperty("directives"))
		{
			GDirective.init(Vue, $params.directives);
		}
	}
}

export function addHook(func)
{
	if (_hookIdList.indexOf(func.name) < 0)
	{
		_hookIdList.push(func.name);
		_hookHash[func.name] = func;
	}
}

export function start()
{
	$router.beforeEach((to, from, next) =>
	{
		var list = [];
		for (var i = 0; i < _hookIdList.length; i++)
		{
			var hookName = _hookIdList[i]
			var promise = new Promise((resolve, reject)=>
			{
				if (getType(_hookHash[hookName]) == "Function")
				{
					_hookHash[hookName](resolve, reject, to, from);
				}
				else
				{
					resolve();
				}
			})
			list.push(promise);
		}

		if (list.length > 0)
		{
			Promise.all(list).then(()=>
			{
				routerPreload(to, next);
			}, (v)=>
			{
				next(v);
			})
		}
		else
		{
			routerPreload(to, next);
		}
	});

	$router.afterEach((to, from) =>
	{
		if (router && router.update)
		{
			router.update(to, from);
		}
	});

	var vuePromise = new Promise(function (resolve, reject)
	{
		vm = new Vue({
			created: resolve,
			router: $router,
			template: `<router-view class='view'></router-view>`
		});
		vm.$mount(el);
		el = vm.$el;
	});

	return vuePromise;
}

function routerPreload(to, next)
{
	if (router)
	{
		router.preload(to, next);
	}
	else
	{
		next();
	}
}

export function removeHook(hookName)
{
	getType(hookName) == "Function" && (hookName = hookName.name);
	if (_hookIdList.indexOf(hookName) >= 0)
	{
		if (_hookHash[hookName])
		{
			delete _hookHash[hookName];
		}

		_hookIdList.splice(_hookIdList.indexOf(hookName), 1);
	}
}

export function http($param, callback, errorback)
{
	if (GCore.webParam.net.hasOwnProperty("timeout") && GCore.webParam.net.timeout != 0)
	{
		$param = __merge($param, {
			timeout: GCore.webParam.net.timeout
		});
	}
	$param.method = $param.method.toUpperCase() || 'GET';

// 	var beforeFun = $param.before;
// 	$param.before = function (req)
// 	{
// 		if (!req)
// 		{
// 			return;
// 		}
// 		_reqHash[req.url] && _reqHash[req.url].abort();
// 		_reqHash[req.url] = req;
// 		beforeFun && beforeFun.call(this);
// 	}

	if ($param.method == "GET")
	{
		Vue.http($param).then(function (data)
		{
			delete _reqHash[data.url];
			callback && callback(data);
		}, function (data)
		{
			delete _reqHash[data.url];
			errorback && errorback(data);
		})
	}
	else
	{
		var url = $param.url;
		delete $param.url;
		var params = $param.params;
		delete $param.params;
		Vue.http.post(url, (params || {}), $param).then(function (data)
		{
			delete _reqHash[data.url];
			callback && callback(data);
		}, function (data)
		{
			delete _reqHash[data.url];
			errorback && errorback(data);
		});
	}
}

export function forceUpdate($depth = 0)
{
// 	if ($depth == 0)
// 	{
	for (var item of vm.$children)
	{
		item.$forceUpdate();
	}
// 	}
// 	else
// 	{
// 		forceUpdate($depth - 1);
// 	}
}

export function getParams($key, $defaultValue = "")
{
	var params = router.currentRoute.params;
	if (params.hasOwnProperty($key))
	{
		return params[$key];
	}

	return $defaultValue;
}

export function getQuery($key, $defaultValue = "")
{
	var query = router.currentRoute.query;
	if (query[$key])
	{
		return query[$key];
	}

	return $defaultValue;
}

export {router};
export {$router};

class RouterClient {

	constructor($router)
	{
		this.$router = $router;
	}

	update(to, from)
	{
		if (from.matched.length > 0)
		{
			if (equal(to.matched[0].path, from.matched[0].path) && (!equal(to.params, from.params) || !equal(to.query, from.query)))
			{
				var item;
				for (var i = 0; i < vm.$children.length; i++)
				{
					item = vm.$children[i];
					if (item.routerUpdated)
					{
						item.routerUpdated();
					}
				}
			}
		}
	}

	preload(to, next)
	{
		var matchedPath = to.matched[0].path || to.fullPath;
		if (matchedPath.indexOf("?") >= 0)
		{
			matchedPath = matchedPath.substr(0, matchedPath.indexOf("?"));
		}
		if (routerHash[matchedPath] && routerHash[matchedPath].preload)
		{
			routerHash[matchedPath].preload(to, next);
		}
		else
		{
			next();
		}
	}

	go(...arg)
	{
		if (this.$router)
		{
			return this.$router.go.apply(this.$router, arg);
		}
		return null;
	}

	push(...arg)
	{
		if (this.$router)
		{
			return this.$router.push.apply(this.$router, arg);
		}
		return null;
	}

	forward(...arg)
	{
		if (this.$router)
		{
			return this.$router.forward.apply(this.$router, arg);
		}
		return null;
	}

	getMatchedComponents(...arg)
	{
		if (this.$router)
		{
			return this.$router.getMatchedComponents.apply(this.$router, arg);
		}
		return null;
	}

	back(...arg)
	{
		if (this.$router)
		{
			return this.$router.back.apply(this.$router, arg);
		}
		return null;
	}

	replace(...arg)
	{
		if (this.$router)
		{
			return this.$router.replace.apply(this.$router, arg);
		}
		return null;
	}

	addHook($key, $callback)
	{
		if (this.$router)
		{
		}
	}

	get options()
	{
		if (this.$router)
		{
			return this.$router.options;
		}
		return false;
	}

	get app()
	{
		if (this.$router)
		{
			return this.$router.app;
		}
		return false;
	}

	get fallback()
	{
		if (this.$router)
		{
			return this.$router.fallback;
		}
		return false;
	}

	get currentRoute()
	{
		if (this.$router)
		{
			return this.$router.currentRoute;
		}
		return null;
	}
}