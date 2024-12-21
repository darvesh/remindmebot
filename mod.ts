import { webhookCallback } from "https://deno.land/x/grammy@v1.33.0/mod.ts";
import { bot } from "./bot.ts";

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
	const url = new URL(req.url);
	console.log(req.method, url.pathname, bot.token, url.pathname.slice(1));
	if (req.method === "POST") {
		if (url.pathname.slice(1) === bot.token) {
			try {
				return await handleUpdate(req);
			} catch (err) {
				console.error(err);
			}
		}
	}
	return new Response("Remindme bot is up and running!");
});
