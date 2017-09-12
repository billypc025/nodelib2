# NodeLib环境搭建文档

> 本项目是一个用于支撑nodejs开发的运行库，整个架构采用了运行库和开发模块分离的方式。通过安装该运行库，可以很方便的开发针对网络及本地脚本的nodejs应用。

--------------------------

## 安装

``` 在项目目录执行
# 安装本地工程模块
$ npm run build
```


## 命令列表

### nodecli
```
$ nodecli   查看usage
```

```
$ nodecli init 初始化当前目录为开发目录
因为架构采用了库模块分离的思想，所以开发目录不应是库目录，切忌在库目录做该操作。
```

```
$ nodecli update 更新框架及本地工具库（可以在任意目录执行）
```

```
$ nodecli add router [routerName] 在开发目录新增一个router
```

```
$ nodecli add server [serverType] 在开发目录新增一个服务类型
目前支持的服务类型有： http socket web redis mysql script express
```

```
$ nodecli add module [moduleName] 在开发目录新增一个开发模块
```

```
$ nodecli add bin [binName] 在开发目录新增一个可执行bin
```

```
$ nodecli start 更新框架及本地工具库（可以在任意目录执行）
```

## 启动服务
> 在工程目录中，运行以下命令
```
$ nodecli start [routerName]
```


## Router文件配置说明
```
{
  "name": "",    //定义本服务进程的名称
  "info": [...],    //要启动的服务列表
  "param": {}    //启动参数
}

info是一个服务列表，所有需要启动的服务，其配置都放在info里
```


### http服务
```
{
  "name": "myServer",        //服务名称
  "type": "http",
  "param": {
	"port": 8001,
	"header": {             //请求默认返回的header
	  "Content-Type": "application/json;charset=utf-8",
	  "Access-Control-Allow-Origin": "{origin}",
	  "Access-Control-Allow-Credentials": "true",
	  "Access-Control-Allow-Methods": "PUT,POST,GET,DELETE,OPTIONS",
	  "Access-Control-Allow-Headers": "X-Requested-With"
	},
	"param": {
	    "method":"*"    //请求默认的类型，该参数缺省，支持传入post/get
	}
  },
  "module": {                               //用于指定开发模块，以键值对的形式指定对应的请求地址关联到哪个模块去处理
	"@/global-test": "./src/module/test",   //key表示请求地址路径, 值开发模块路径（@表示模块为全局共享的单例模块）
	"/test": "./src/module/test"            
  },
  "enabled": true                           //服务是否开启： true开启（默认） false不开启
}
```

### mysql服务
```
{
  "name": "myServer",      //服务名称
  "type": "mysql",
  "param": {
	"host": "localhost",      //服务地址
	"user": "admin",            //账号
	"password": "123456",        //密码
	"database": "testdb"         //库名
  },
  "enabled": true
}
```

### redis服务
```
{
  "name": "myServer",       //服务名称
  "type": "redis",
  "param": {
	"port": 6379,           //服务端口
	"host": "127.0.0.1",    //服务地址
	"monitor": "./log/redis/"   //日志存放目录地址
  },
  "enabled": true
}
```

### web服务
```
{
  "name": "myWeb",    //服务的名称
  "type": "web",
  "param": {
	"port": 80,             //服务端口
	"webroot": "./webroot"  //web目录地址
  },
  "enabled": true
}
```

### script服务
```
{
  "name": "myScript",       //服务名称
  "type": "script",
  "param": {                //脚本默认执行参数
	"path": "test.hello",   //脚本默认执行的模块路径
	"param": "billy"        //脚本默认执行的模块的参数
  },
  "module": {                   //用于定义开发模块关联
	"test": "./src/module/test"  //对应param
  },
  "enabled": true
}
```