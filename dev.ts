import { bot } from "./bot.ts";

bot.catch(console.error);

bot.start({
	onStart: () => console.log("Bot started!"),
	drop_pending_updates: true,
});
