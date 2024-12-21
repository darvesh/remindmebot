import { Bot } from "https://deno.land/x/grammy@v1.33.0/mod.ts";
import interval from "https://esm.sh/human-interval@2.0.1";
import parser from "https://esm.sh/parse-ms@3.0.0";
import {
	deleteReminder,
	getReminders,
	kv,
	setReminder,
	type Reminder,
} from "./kv.ts";
import { commands, PATTERN } from "./static.ts";
import { dateFormatter, escapeHTML, formatTime, processTime } from "./util.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") as string;
if (!BOT_TOKEN) {
	throw new Error("BOT_TOKEN is not provided");
}
const QUEUE_DELAY_MS =
	(Number(Deno.env.get("QUEUE_DELAY_IN_SECONDS")) || 0) * 1000;

const bot = new Bot(BOT_TOKEN);
bot.command("start", (ctx) => ctx.reply(commands.start));
bot.command("help", (ctx) => ctx.reply(commands.helpme));

bot
	.filter((ctx) => ctx.hasChatType(["group", "supergroup", "private"]))
	.hears(PATTERN, async (ctx) => {
		const matches = ctx.match;
		if (!matches) return;
		const [, rawTime, message] = matches;

		if (!ctx.chat.id) {
			await ctx.reply("I'm unable to find chat id. Reminder not set");
			return;
		}
		if (!ctx.message.message_id) {
			await ctx.reply("I'm unable to find message id. Reminder not set");
			return;
		}
		const time = processTime(rawTime.trim());
		const intervalTime = interval(time);
		if (!intervalTime) return ctx.reply("Invalid time format");
		const now = new Date();

		const timeToExecute = new Date(now.getTime() + intervalTime);

		const reminder: Reminder = {
			chatId: ctx.chatId,
			executionDate: timeToExecute,
			username: ctx.from?.username || "[username]",
			message,
			replyMessageId: ctx.message.message_id,
		};

		const tomorrow = new Date(new Date().setDate(now.getDate() + 1)).setHours(
			0,
			0,
			0,
			0
		);
		if (timeToExecute.getTime() < tomorrow) {
			kv.enqueue(reminder, {
				delay: intervalTime - QUEUE_DELAY_MS,
			});
		} else {
			await setReminder(now, reminder);
		}
		const replyMessage = `I'll remind you in ${formatTime(
			parser(intervalTime)
		)}\n${dateFormatter.format(timeToExecute)} UTC`;

		await ctx.reply(replyMessage, {
			reply_parameters: {
				message_id: ctx.message.message_id,
				chat_id: ctx.chatId,
			},
		});
	});

Deno.cron("Schedule Reminders", "0 0 * * *", async () => {
	const now = new Date();
	const reminders = await getReminders(now);
	console.log("Found " + reminders.length + " reminders");
	for (const reminder of reminders) {
		const diffInMs =
			reminder.executionDate.getHours() * 60 * 60 * 1000 +
			reminder.executionDate.getMinutes() * 60 * 1000 +
			reminder.executionDate.getSeconds() * 1000 -
			now.getHours() * 60 * 60 * 1000 -
			now.getMinutes() * 60 * 1000 -
			now.getSeconds() * 1000;
		kv.enqueue(reminder, {
			delay: diffInMs - QUEUE_DELAY_MS,
		});
	}
	await deleteReminder(now);
});

kv.listenQueue(async (record: Reminder) => {
	try {
		await sendMessage(record);
	} catch (error) {
		console.error(error);
	}
});

async function sendMessage(reminder: Reminder) {
	const chatId = reminder.chatId;
	const message = escapeHTML(reminder.message || "");
	const replyMessageId = reminder.replyMessageId;
	const username = reminder.username;

	const replyMessage = `Hey @${username}, Here is your reminder.${
		message ? `\n\n${message}` : ""
	}`;
	await bot.api.sendMessage(chatId, replyMessage, {
		...(replyMessageId && {
			reply_parameters: {
				message_id: replyMessageId,
				chat_id: chatId,
				allow_sending_without_reply: true,
			},
		}),
	});
}

export { bot };
