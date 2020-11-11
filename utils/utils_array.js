/**
 * Created by billy on 2020/11/11.
 */

Array.prototype.toHash = toHash;
Array.prototype.mergeTo = mergeTo;
Array.prototype.mergeList = mergeList;
Array.prototype.toCountHash = toCountHash;
Array.prototype.toListBy = toListBy;
Array.prototype.sortByKeyList = sortByKeyList;

//数组转object
function toHash($key = "id", $toArray = false, $valKey = "")
{
	var hash = {};
	for (var item of this)
	{
		var val = item;
		if ($valKey)
		{
			val = item[$valKey];
		}
		if (!$toArray)
		{
			hash[item[$key]] = val;
		}
		else
		{
			if (!hash[item[$key]])
			{
				hash[item[$key]] = [];
			}

			hash[item[$key]].push(val);
		}
	}
	return hash;
}

/**
 * 数组根据指标标识,计算数量
 * @param $key
 * @param $totalKey
 * @return {{}}
 * 【示例】
 * var list=[{userId:"aaa"},{userId:"bbb"},{userId:"aaa"},{userId:"aaa"}]
 * list.toCountHash("userId","orderNum")
 * 结果:{aaa:3,bbb:1}
 */
function toCountHash($key = "id", $totalKey)
{
	var hash = {};
	for (var item of this)
	{
		var id = item[$key];
		if (!hash[id])
		{
			if ($totalKey)
			{
				var obj = {};
				obj[$totalKey] = 0;
				hash[id] = obj;
			}
			else
			{
				hash[id] = 0;
			}
		}
		if ($totalKey)
		{
			hash[id][$totalKey]++;
		}
		else
		{
			hash[id]++;
		}
	}
	return hash;
}

/**
 * 将传入的hash数据,更新到当前数组
 * @param $hash 目标hash数据集(待合并数据)
 * @param $key  源数据待更新字段名称
 * 【示例】
 * var list=[{id:1,name:"A",age:0},{id:2,name:"B",age:0}];
 * var hash={1:11,2:20};
 * list.mergeTo(hash, "id","age");
 * 结果: [{id:1,name:"A",age:11},{id:2,name:"B",age:20}]
 */
function mergeTo($hash, $key, $mergeKey = null)
{
	for (var item of this)
	{
		var target = $hash[item[$key]];
		if ($mergeKey)
		{
			item[$mergeKey] = $hash[item[$key]]
		}
		else
		{
			delete target[$key];
			__merge(item, target, true);
		}
	}
}

/**
 * 将传入数组的数据合并到当前数组
 * @param $list 目标数据数组(待合并数据)
 * @param $key 目标数据的id名称(数据唯一标识)
 * @param $key2 源数据的id名称(源数据唯一标识)
 * 【示例】
 * var list1=[{id:1,name:"A"}];
 * var list2=[{sid:1,"age":11}]
 * list1.mergeList(list2,"sid","id");
 * 结果: [{id:1,name:"A",age:11}]
 */
function mergeList($list, $key, $key2, $mergeFunc = __merge)
{
	var hash = {};
	for (let item of $list)
	{
		hash[item[$key]] = item;
		delete item[$key];
	}
	for (let item of this)
	{
		var target = hash[item[$key2]];
		$mergeFunc(item, target);
	}
}

/**
 * 生成数组内对象某一字段值的新数组
 * @param $key 字段名
 * @param $filterEmpty 过滤空数据
 * @return {Array.<T>}
 * 【示例】
 * var list = [{id: 1}, {id: 3}, {id: 2}, {id: 3}, {id: 2}, {id: 1}];
 * list = list.toListBy("id");
 * 结果: [1,3,2]
 */
function toListBy($key, $filterEmpty = true)
{
	return this.map(v=>v[$key]).filter((v, index, arr)=>arr.indexOf(v) == index && ($filterEmpty ? !!v : true));
}

function sortByKeyList($sortKey = "", $sortList = [])
{
	if ($sortList.length > 0)
	{
		this.sort((a, b)=>
		{
			var valA = $sortKey ? a[$sortKey] : a;
			var valB = $sortKey ? b[$sortKey] : b;
			return $sortList.indexOf(valA) - $sortList.indexOf(valB);
		});
	}
}