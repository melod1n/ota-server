import SQLite from "sqlite3";

export abstract class BaseStorage<T> {

	abstract tableName: string;

	protected db: SQLite.Database;

	constructor(db: SQLite.Database) {
		this.db = db;
	}

	abstract getAll(): Promise<T[]>;

	abstract clear(): Promise<never>;


}