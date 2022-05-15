import parser from "https://esm.sh/parse-ms@3.0.0";
import interval from "https://esm.sh/human-interval@2.0.1";
import { Bot } from "https://deno.land/x/grammy@v1.8.3/mod.ts";

import { Reminder } from "./db.ts";
import { commands } from "./command.ts";
import { BOT_TOKEN, USER_ID } from "./config.ts";
import { processTime, formatTime, wait, escapeHTML } from "./util.ts";

const FIVE_MINUTES = 5 * 60 * 1000;

const PATTERN =
	/^\/remindme\s(\d{1,3}(?:\.\d{1,3})? ?(?:s|sec|m|min|h|hr|d|day|second|seconds|minute|minutes|hour|hours|day|days) ?)+(?:\n([\s\w\d/\.&`~$#@%!\\{}()\*\-+=_]+))?$/;

const bot = new Bot(BOT_TOKEN);

Object.entries(commands).forEach(([key, value]) =>
	bot.command(
		key,
		async (ctx) =>
			await ctx.reply(value, {
				parse_mode: "HTML",
				disable_web_page_preview: true,
			})
	)
);

bot.hears(PATTERN, async (ctx) => {
	if (!ctx.from?.username) return;
	const [, rawTime, message] = ctx.match;

	if (!message && !ctx.message?.reply_to_message?.message_id) {
		return await ctx.reply(
			"Please reply to a message or add a message in the next line.",
			{
				reply_to_message_id: ctx.message?.message_id,
			}
		);
	}

	const timeString = processTime(rawTime);
	const time = interval(timeString);

	const now = Date.now();
	if (!time || now + time < now) {
		return await ctx.reply("Invalid time", {
			reply_to_message_id: ctx.message?.message_id,
		});
	}

	await ctx.reply(
		`I'll remind you (@${ctx.from?.username}) in ${formatTime(parser(time))}`,
		{
			reply_to_message_id: ctx.message?.message_id,
		}
	);

	if (time < FIVE_MINUTES) {
		return setTimeout(
			() =>
				ctx
					.reply(
						`Here is your reminder!${" @" + ctx.from?.username}⏰${
							message ? `\n${escapeHTML(message)}` : ""
						}`,
						{
							reply_to_message_id:
								ctx.message?.reply_to_message?.message_id ||
								ctx.message.message_id,
							parse_mode: "HTML",
						}
					)
					.catch(),
			time
		);
	}

	await Reminder.insertOne({
		chatId: ctx.from!.id,
		date: now + time,
		message,
		replyMessageId: ctx.message?.reply_to_message?.message_id,
		username: ctx.from.username,
		messageId: ctx.message.message_id,
	});
});

bot
	.filter((ctx) => ctx.chat?.type === "private" && ctx.from?.id === USER_ID)
	.command("stat", async (ctx) => {
		const stat = await Reminder.countDocuments();
		await ctx.reply(`Pending reminders: ${stat}`);
	});

bot.catch(console.error);

bot.start({
	onStart: () => console.log("Bot started!"),
	drop_pending_updates: true,
});

setInterval(() => {
	const now = Date.now();
	Reminder.find(
		{
			date: { $gte: Date.now(), $lt: Date.now() + FIVE_MINUTES },
		},
		{ sort: { date: 1 } }
	)
		.toArray()
		.then((reminders) =>
			reminders.map((reminder) =>
				wait(reminder.date - now)
					.then(() =>
						bot.api.sendMessage(
							reminder.chatId,
							`Here is your reminder!${" @" + reminder.username}⏰${
								reminder.message ? `\n${escapeHTML(reminder.message)}` : ""
							}`,
							{
								reply_to_message_id:
									reminder.replyMessageId || reminder.messageId,
								parse_mode: "HTML",
							}
						)
					)
					.catch()
					.finally(() => Reminder.deleteOne({ _id: reminder._id }))
			)
		)
		.catch();
}, FIVE_MINUTES);
