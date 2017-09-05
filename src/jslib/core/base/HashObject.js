/**
 * Created by billy on 2016/11/30.
 */
var __define = function (o, p, g, s)
	{
		Object.defineProperty(o, p, {
			configurable: true,
			enumerable: true,
			get: g,
			set: s
		});
	};
window.__define=__define;

var __extends = function(d, b)
{
	for (var p in b)
	{
		if (b.hasOwnProperty(p))
		{
			d[p] = b[p];
		}
	}
	function __()
	{
		this.constructor = d;
	}

	__.prototype = b.prototype;
	d.prototype = new __();
}
window.__extends=__extends;

var _hashCount = 0;
var HashObject = function ()
{
	function HashObject()
	{
		this.$hashCode = _hashCount++;
	}

	var d = __define, c = HashObject, p = c.prototype;
	d(p, "hashCode"
		, function ()
		{
			return this.$hashCode;
		}
	);
	return HashObject;
}();

export default HashObject;