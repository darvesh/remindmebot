export const commands = {
	start:
		"<b>Reddit-like !remindme function for groups!</b> \n\n" +
		"Bot written by: @solooo7 \nSource: https://github.com/darvesh/remindmebot\n" +
		"Support me: https://www.buymeacoffee.com/darvesh\n\n" +
		"Use /helpme to know how to use the bot.",
	helpme:
		"<b>Usage Examples</b> \n\n" +
		"[<b>By replying to a message</b>]\n" +
		// "--------------------------------\n" +
		"<code>/remindme 2minutes3seconds</code>\n" +
		"<code>/remindme 42h</code>\n" +
		"<code>/remindme 60s1m //will remind you in 2 minutes</code>\n\n" +
		"[<b>By writing a message</b>]\n" +
		// "--------------------------------\n" +
		"<code>/remindme 1h\nRewrite TypeScript in Zig</code>\n\n" +
		"<code>/remindme 2h\nBuy Golang and delete it</code>\n\n" +
		"Supports: <code>s|sec|m|min|h|hr|d|day|second|seconds|minute|minutes|hour|hours|day|days</code>",
};

export const PATTERN =
	/^\/remindme\s((?:\d{1,3}(?:\.\d{1,3})? ?(?:s|sec|m|min|h|hr|d|day|second|seconds|minute|minutes|hour|hours|day|days) ?)+)(?:\n([\s\w\d/\.&`~$#@%!\\{}()\*\-+=_\[\]^?<>'\"]+))?$/;
