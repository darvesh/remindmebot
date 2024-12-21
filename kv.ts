export type Reminder = {
	username: string;
	chatId: number;
	message?: string;
	replyMessageId?: number;
	executionDate: Date;
};

export const kv = await Deno.openKv();

export async function getReminders(cycleDate: Date) {
	const year = cycleDate.getUTCFullYear();
	const month = cycleDate.getUTCMonth();
	const date = cycleDate.getUTCDate();
	const key = [year, month, date];
	console.log("Getting reminders for", key);
	const result = await kv.get<Reminder[]>(key);
	if (Array.isArray(result.value)) return result.value;
	return [];
}

export async function deleteReminder(cycleDate: Date) {
	const year = cycleDate.getUTCFullYear();
	const month = cycleDate.getUTCMonth();
	const date = cycleDate.getUTCDate();
	const key = [year, month, date];
	await kv.delete(key);
}

export async function setReminder(cycleDate: Date, reminder: Reminder) {
	const year = cycleDate.getUTCFullYear();
	const month = cycleDate.getUTCMonth();
	const date = cycleDate.getUTCDate();
	const key = [year, month, date];
	const result = await kv.get<Reminder[]>(key);
	console.log({ result });

	const reminders = Array.isArray(result.value)
		? [...result.value, reminder]
		: [reminder];

	await kv.set(key, reminders);
	console.log("Saved reminder", key, reminder);
}
