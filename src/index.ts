import { Bot } from "grammy";
import rawTimeToTimestamp from "human-interval";

import { PATTERN } from "./constant.js";
import { commands } from "./command.js";
import { connectToDb, Reminder } from "./db.js";
import { TOKEN, SCHEDULER_TIME, MY_USER_ID } from "./config.js";
import { convertTime, processTimeString } from "./util.js";
import { checkBacklogs, runScheduler, sendReminder } from "./helper.js";

const bot = new Bot(TOKEN);

const connection = await connectToDb();
const reminderRepo = connection.getRepository(Reminder);

//start and help commands
Object.entries(commands).map(([command, message]) => {
	bot.command(
		command,
		async ctx =>
			await ctx
				.reply(message, {
					parse_mode: "HTML",
					disable_web_page_preview: true,
				})
				.then(message => {
					//delete the message if it's not a direct message to bot
					if (ctx.message?.chat.id && ctx.message.chat.type !== "private")
						setTimeout(
							() =>
								bot.api
									.deleteMessage(ctx.message.chat.id, message.message_id)
									.catch((error: Error) => console.trace(error)),
							25 * 1000,
						);
				}),
	);
});

//check if there is any backlogs and notify user that bot missed reminders
await checkBacklogs(bot, reminderRepo);

// every 5 minutes, pick up all reminders from the db for the next 5 minutes
// and schedule it to send
runScheduler(bot, reminderRepo);

bot.hears(PATTERN, async ctx => {
	const date = new Date();
	// Ignore the message if these conditions are not met.
	if (!ctx.message?.text || !ctx.message.from?.username) return;
	// If the user hasn't replied any message, notify the user that they have to reply to a message
	// then delete the message after 10 seconds
	if (!ctx.message.reply_to_message?.message_id) {
		await ctx.reply("Please reply to a message!", {
			reply_to_message_id: ctx.message.message_id,
		});
		return;
	}

	const chatId = ctx.message.chat.id;
	const username = ctx.message.from.username;
	const messageId = ctx.message.reply_to_message.message_id;

	const rawTime = processTimeString(ctx.message.text);
	const timestamp = rawTimeToTimestamp(rawTime);
	// unlikely to happen but I'll have a check anyway
	if (!timestamp) {
		return ctx.reply(
			"I didn't understand when to remind you. Please specify the time using the correct format!",
			{
				reply_to_message_id: ctx.message.message_id,
			},
		);
	}
	//send a confirmation message to user with parsed time that reminder has been successfully set.
	await ctx.reply(`I'll remind you in ${convertTime(timestamp)}`, {
		reply_to_message_id: messageId,
	});

	// If message needs to be sent within 5 minutes, don't save it in the db, just schedule it
	const fiveMinutes = 5 * 60 * 1000;
	if (timestamp < fiveMinutes)
		return setTimeout(
			() => sendReminder(bot, { chatId, messageId, username }),
			timestamp,
		);

	// Otherwise save it in the db to pick it up in the next batch
	await reminderRepo
		.insert({
			chatId,
			messageId,
			username,
			time: date.getTime() + timestamp,
		})
		.catch(console.error);
});

bot
	.filter(ctx => ctx.chat?.type === "private" && ctx.from?.id === MY_USER_ID)
	.command("stat", async ctx => {
		const stat = await reminderRepo.count();
		await ctx.reply(`Pending reminders: ${stat}`);
	});

bot.catch((error: Error) => console.error(error.message));

bot.start({ onStart: () => "Bot started!" });
