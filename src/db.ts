import typeorm from "typeorm";

const { Column, Entity, createConnection, PrimaryGeneratedColumn } = typeorm;

@Entity({
	name: "reminder",
})
export class Reminder extends typeorm.BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;
	@Column()
	messageId!: number;
	@Column()
	chatId!: number;
	@Column()
	username!: string;
	@Column()
	time!: number;
}

export const connectToDb = () =>
	createConnection({
		type: "better-sqlite3",
		database: "database.sql",
		entities: [Reminder],
		synchronize: true,
	});
