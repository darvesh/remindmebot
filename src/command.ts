//Yes, I know about template literals.
//I don't prefer to use it here to reduce line width
export const commands = {
	start:
		"<b>Reddit-like !remindme function for groups!</b> \n" +
		"Use /helpme to know how to use the bot.\n\n" +
		"Bot written by: @solooo7 \nSource: https://github.com/darvesh/remindmebot\n" +
		"Support me: https://www.buymeacoffee.com/darvesh",
	helpme:
		" - Add me to a group. \n- Send a message using the format below replying to a message \n<code>!remindme number&lt;d|day|days|hours|hour|h|minutes|minute|m|seconds|second|s&gt; ...</code>\n\n" +
		"Examples:\n" +
		"<code>!remindme 20d2h\n" +
		"!remindme 2minutes3seconds\n" +
		"!remindme 42h\n" +
		"!remindme 32minutes40s\n" +
		"!remindme 1000seconds\n" +
		"!remindme 60s1m //will remind you in 2 minutes\n" +
		"!remindme 20m1h //will remind you in 1hour 20 minute</code>\n",
};
