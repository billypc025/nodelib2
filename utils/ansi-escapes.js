/**
 * Created by billy on 2020/12/23.
 */
const ESC = "\u001B[";
const OSC = "\u001B]";
const BEL = "\u0007";
const SEP = ";";
const isTerminalApp = process.env.TERM_PROGRAM === "Apple_Terminal";

exports.cursorTo = (x, y) =>
{
	if (typeof x !== "number")
	{
		throw new TypeError("The `x` argument is required");
	}

	if (typeof y !== "number")
	{
		return ESC + (x + 1) + "G";
	}

	return ESC + (y + 1) + ";" + (x + 1) + "H";
};

exports.cursorMove = (x, y) =>
{
	if (typeof x !== "number")
	{
		throw new TypeError("The `x` argument is required");
	}

	let ret = "";

	if (x < 0)
	{
		ret += ESC + (-x) + "D";
	}
	else if (x > 0)
	{
		ret += ESC + x + "C";
	}

	if (y < 0)
	{
		ret += ESC + (-y) + "A";
	}
	else if (y > 0)
	{
		ret += ESC + y + "B";
	}

	return ret;
};

exports.cursorUp = (count = 1) => ESC + count + "A";
exports.cursorDown = (count = 1) => ESC + count + "B";
exports.cursorForward = (count = 1) => ESC + count + "C";
exports.cursorBackward = (count = 1) => ESC + count + "D";
exports.cursorLeft = ESC + "G";
exports.cursorSavePosition = isTerminalApp ? "\u001B7" : ESC + "s";
exports.cursorRestorePosition = isTerminalApp ? "\u001B8" : ESC + "u";
exports.cursorGetPosition = ESC + "6n";
exports.cursorNextLine = ESC + "E";
exports.cursorPrevLine = ESC + "F";
exports.cursorHide = ESC + "?25l";
exports.cursorShow = ESC + "?25h";
exports.eraseLines = count =>
{
	let clear = "";

	for (let i = 0; i < count; i++)
	{
		clear += exports.eraseLine + (i < count - 1 ? exports.cursorUp() : "");
	}

	if (count)
	{
		clear += exports.cursorLeft;
	}

	return clear;
};
exports.eraseEndLine = ESC + "K";
exports.eraseStartLine = ESC + "1K";
exports.eraseLine = ESC + "2K";
exports.eraseDown = ESC + "J";
exports.eraseUp = ESC + "1J";
exports.eraseScreen = ESC + "2J";
exports.scrollUp = ESC + "S";
exports.scrollDown = ESC + "T";
exports.clearScreen = "\u001Bc";
exports.clearTerminal = process.platform === "win32" ? `${exports.eraseScreen}${ESC}0f` : `${exports.eraseScreen}${ESC}3J${ESC}H`;
exports.beep = BEL;
exports.link = (text, url) =>
{
	return [OSC, "8", SEP, SEP, url, BEL, text, OSC, "8", SEP, SEP, BEL].join("");
};

exports.image = (buffer, options = {}) =>
{
	let ret = `${OSC}1337;File=inline=1`;

	if (options.width)
	{
		ret += `;width=${options.width}`;
	}

	if (options.height)
	{
		ret += `;height=${options.height}`;
	}

	if (options.preserveAspectRatio === false)
	{
		ret += ";preserveAspectRatio=0";
	}

	return ret + ":" + buffer.toString("base64") + BEL;
};

exports.iTerm = {
	setCwd: (cwd = process.cwd()) => `${OSC}50;CurrentDir=${cwd}${BEL}`,

	annotation: (message, options = {}) =>
	{
		let ret = `${OSC}1337;`;

		const hasX = typeof options.x !== "undefined";
		const hasY = typeof options.y !== "undefined";
		if ((hasX || hasY) && !(hasX && hasY && typeof options.length !== "undefined"))
		{
			throw new Error("`x`, `y` and `length` must be defined when `x` or `y` is defined");
		}

		message = message.replace(/\|/g, "");

		ret += options.isHidden ? "AddHiddenAnnotation=" : "AddAnnotation=";

		if (options.length > 0)
		{
			ret +=
				(hasX ?
					[message, options.length, options.x, options.y] :
					[options.length, message]).join("|");
		}
		else
		{
			ret += message;
		}

		return ret + BEL;
	}
};
