import { Bot } from "grammy";
import rawTimeToTimestamp from "human-interval";

import { connectToDb, Reminder } from "./db.js";
import { TOKEN, SCHEDULER_TIME } from "./config.js";
import { convertTime, processTimeString } from "./util.js";
import { PATTERN, MESSAGE_DELETE_TIME } from "./constant.js";
import { checkBacklogs, runScheduler, sendReminder } from "./helper.js";

const bot = new Bot(TOKEN);

const connection = await connectToDb();
const reminderRepo = connection.getRepository(Reminder);

//check if there is any backlogs and notify user that bot missed reminders
await checkBacklogs(bot, reminderRepo);

// every 5 minutes, pick up all reminders from the db for the next 5 minutes
// and schedule it to send
runScheduler(bot, reminderRepo);

bot.hears(PATTERN, async (ctx) => {
  // Ignore the message if these conditions are not met.
  if (!ctx.message?.text || !ctx.message.from?.username) return;
  // If the user hasn't replied any message, notify the user that they have to reply to a message
  // then delete the message after 10 seconds
  if (!ctx.message.reply_to_message?.message_id) {
    const message = await ctx.reply("Please reply to a message!", {
      reply_to_message_id: ctx.message.message_id,
    });
    setTimeout(() => {
      ctx.api
        .deleteMessage(ctx.message.chat.id, message.message_id)
        .catch(() => {});
    }, MESSAGE_DELETE_TIME);
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
        reply_to_message_id: messageId,
      }
    );
  }
  //send a confirmation message to user with parsed time that reminder has been successfully set.
  const message = await ctx.reply(
    `I'll remind you in ${convertTime(timestamp)}`,
    {
      reply_to_message_id: messageId,
    }
  );
  //delete the confirmation message after TEN_SECONDS
  setTimeout(() => {
    ctx.api.deleteMessage(chatId, message.message_id).catch(() => {});
  }, MESSAGE_DELETE_TIME);

  // If message needs to be sent within 5 minutes, don't save it in the db, just schedule it
  if (timestamp < SCHEDULER_TIME)
    return setTimeout(() => {
      sendReminder(bot, { chatId, messageId, username });
    }, timestamp);

  // Otherwise save it in the db to pick it up in the next batch
  await reminderRepo
    .insert({
      chatId,
      messageId,
      username,
      time: Date.now() + timestamp,
    })
    .catch(console.error);
});

bot.catch((error: Error) => console.error(error.message));

bot.start({ onStart: () => "Bot started!" });
