import {
	ObjectId,
	MongoClient,
} from "https://deno.land/x/mongo@v0.29.4/mod.ts";

import { DB_HOST, DB_USER, DB_NAME, DB_PASSWORD } from "./config.ts";

const client = new MongoClient();

await client.connect(
	`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}?retryWrites=true&w=majority&authMechanism=SCRAM-SHA-1`
);

type ReminderSchema = {
	_id: ObjectId;
	username: string;
	chatId: number;
	date: number;
	message?: string;
	replyMessageId?: number;
	messageId: number;
};

const db = client.database(DB_NAME);

export const Reminder = db.collection<ReminderSchema>("reminder");
