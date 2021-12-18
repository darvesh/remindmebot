import { Bot } from "grammy";
import typeorm from "typeorm";

import { Reminder } from "./db.js";
import { SCHEDULER_TIME } from "./config.js";

/**
 * Sends reminder message to user and logs if it fails
 * @param bot grammy bot instance
 * @param reminder `Reminder` entity
 */
export const sendReminder = async (
	bot: Bot,
	reminder: Pick<Reminder, "chatId" | "messageId" | "username">,
) => {
	try {
		await bot.api.sendMessage(
			reminder.chatId,
			`Here is your reminder! @${reminder.username}⏰`,
			{
				reply_to_message_id: reminder.messageId,
			},
		);
	} catch (error) {
		if (error instanceof Error) console.error(error.message);
		console.error(JSON.stringify(reminder, null, 2));
	}
};

/**
 * Runs before bot starts,
 * checks if bot missed any reminders when it was offline and sends apologies
 * */
export const checkBacklogs = async (
	bot: Bot,
	reminderRepo: typeorm.Repository<Reminder>,
) => {
	try {
		const reminders = await reminderRepo.find({
			where: {
				time: typeorm.LessThan(Date.now()),
			},
		});
		await Promise.allSettled(
			reminders.map(reminder =>
				bot.api
					.sendMessage(
						reminder.chatId,
						`Hey, I was offline when I was supposed to send you a reminder. Apologies @${reminder.username}`,
						{
							reply_to_message_id: reminder.messageId,
						},
					)
					.then(() => reminderRepo.delete({ id: reminder.id })),
			),
		);
	} catch (error) {
		console.trace(error);
	}
};

export const runScheduler = (
	bot: Bot,
	reminderRepo: typeorm.Repository<Reminder>,
) => {
	setInterval(async () => {
		try {
			const reminders = await reminderRepo.find({
				where: {
					time: typeorm.LessThan(Date.now() + SCHEDULER_TIME),
				},
			});
			for (const reminder of reminders) {
				setTimeout(
					() =>
						sendReminder(bot, reminder)
							.then(() => reminderRepo.delete({ id: reminder.id }))
							.catch((error: Error) => console.trace(error.message)),
					reminder.time - Date.now(),
				);
			}
		} catch (error) {
			console.error(error);
		}
	}, SCHEDULER_TIME);
};
