/**
 * Created by billy on 2016/12/14.
 */
var _hash;       //语言包 {[lang:string]:{[langKey:string]:string}}
class LangPool {
	constructor()
	{
	}

	setLang($langHash)
	{
		if ($langHash)
		{
			_hash = $langHash;
		}
	}

	get hash()
	{
		return _hash;
	}
}

var langPool = new LangPool()

export {langPool};

export function lang($langKey)
{
	if (_hash && _hash[$langKey])
	{
		return _hash[$langKey];
	}
	else
	{
		return "";
	}
}