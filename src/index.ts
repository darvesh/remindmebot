import { Bot } from "grammy";
import parseTime from "human-interval";
import parseMs from "parse-ms";

import { TOKEN } from "./config.js";

const bot = new Bot(TOKEN);

const pattern =
  /^!remindme\s(\d{1,5}(\.\d{1,3})?\s?(s|sec|m|min|h|hr|d|day|second|seconds|minute|minutes|hour|hours|day|days)\s?)+$/;

const convertTime = (num: number) => {
  const t = parseMs(num);

  const k = `${t.days ? `${t.days} day(s) ` : ""}${
    t.hours ? `${t.hours} hour(s) ` : ""
  }${t.minutes ? `${t.minutes} minute(s) ` : ""}${
    t.seconds ? `${t.seconds} second(s) ` : ""
  }`;
  return k;
};

bot.hears(pattern, async (ctx) => {
  if (!ctx.message?.text) return;
  if (!ctx.message.from?.username) return;
  if (!ctx.message.reply_to_message?.message_id) {
    const message = await ctx.reply("Please reply to a message!");
    setTimeout(() => {
      ctx.api
        .deleteMessage(ctx.message.chat.id, message.message_id)
        .catch(() => {});
    }, 10 * 1000);
  }
  const rawTime = ctx.message.text
    .substring(10)
    .replace(/d/g, "day")
    .replace(/m|min/g, "minute")
    .replace(/s|sec/g, "second")
    .replace(/h|hr/g, "hour");
  const time = parseTime(rawTime);
  if (!time) return;
  const message = await ctx.reply(
    `Reminder set! \nI'll remind you in ${convertTime(time)}`,
    {
      reply_to_message_id: ctx.message.message_id,
    }
  );
  setTimeout(() => {
    ctx.api
      .deleteMessage(ctx.message.chat.id, message.message_id)
      .catch(() => {});
  }, 10 * 1000);
  setTimeout(() => {
    ctx
      .reply(`Here is your reminder! @${ctx.message.from?.username}⏰`, {
        reply_to_message_id: ctx.message.reply_to_message?.message_id,
      })
      .catch((error: Error) => console.log(error.message));
  }, time);
});

bot.catch((error: Error) => console.error(error.message));

bot.start();
