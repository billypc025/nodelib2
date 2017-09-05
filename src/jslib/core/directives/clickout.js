/**
 * Created by billy on 2017/2/28.
 */
import "../utils/utils";

const nodeList = [];
const ctx = '@@clickoutsideContext';
var nodeNum = 0;

function addNode($el)
{
	if (nodeNum == 0)
	{
		on(document, 'click', clickHandler);
	}
	nodeNum++;
	return nodeList.push($el);
}

function removeNode($index)
{
	nodeNum--;
	if (nodeNum == 0)
	{
		off(document, 'click', clickHandler);
	}
	nodeList.splice($index, 1);
}

function clickHandler(e)
{
	nodeList.forEach(node => node[ctx].documentHandler(e));
}

/**
 * 自定义指令：clickout
 * <div v-clickout="onClickout_div"></div>
 */
export default {
	name: "clickout",
	inserted(el, binding, vnode) {
		const id = addNode(el) - 1;
		const documentHandler = function (e)
		{
			trace(vnode)
			if (vnode.data.hasOwnProperty("directives"))
			{
				for (var directiveItem of vnode.data.directives)
				{
					if (directiveItem.rawName == "v-show")
					{
						trace(vnode.context.$data[directiveItem.expression])
// 						return;
					}
				}
			}
			if (!vnode.context || el.contains(e.target) ||
				(vnode.context.popperElm && vnode.context.popperElm.contains(e.target)))
			{
				return;
			}

			if (binding.expression && el[ctx].methodName && vnode.context[el[ctx].methodName])
			{
				vnode.context[el[ctx].methodName]();
			}
			else
			{
				el[ctx].bindingFunc && el[ctx].bindingFunc();
			}
		};
		el[ctx] = {
			id,
			documentHandler,
			methodName: binding.expression,
			bindingFunc: binding.value
		};
	},

	update(el, binding) {
		el[ctx].methodName = binding.expression;
		el[ctx].bindingFunc = binding.value;
	},

	unbind(el) {
		let len = nodeList.length;

		for (let i = 0; i < len; i++)
		{
			if (nodeList[i][ctx].id === el[ctx].id)
			{
				removeNode(i);
				break;
			}
		}
	}
};
