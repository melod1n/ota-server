import SQLite from "sqlite3";

export const appDatabase = new SQLite.Database("data/database.sqlite");

export class DatabaseManager {
	private createProductsTable = "CREATE TABLE IF NOT EXISTS \"products\" (\n" +
		"\"id\" INTEGER NOT NULL UNIQUE,\n" +
		"\"name\" TEXT NOT NULL UNIQUE,\n" +
		"PRIMARY KEY(\"id\" AUTOINCREMENT)\n" +
		");";
	private createBranchesTable = "CREATE TABLE IF NOT EXISTS \"branches\" (\n" +
		"\"id\" INTEGER NOT NULL UNIQUE,\n" +
		"\"name\" TEXT NOT NULL,\n" +
		"\"productId\" INTEGER NOT NULL,\n" +
		"PRIMARY KEY(\"id\" AUTOINCREMENT)\n" +
		");";
	private createReleasesTable = "CREATE TABLE IF NOT EXISTS \"releases\" (\n" +
		"\"id\" INTEGER NOT NULL UNIQUE,\n" +
		"\"versionName\" TEXT NOT NULL,\n" +
		"\"versionCode\" INTEGER NOT NULL,\n" +
		"\"productId\" INTEGER NOT NULL,\n" +
		"\"branchId\" INTEGER NOT NULL,\n" +
		"\"mandatory\" INTEGER NOT NULL DEFAULT 0,\n" +
		"\"changelog\" TEXT,\n" +
		"\"downloadLink\" TEXT,\n" +
		"\"enabled\" INTEGER NOT NULL DEFAULT 1,\n" +
		"\"fileName\" INTEGER,\n" +
		"\"date\" INTEGER NOT NULL,\n" +
		"PRIMARY KEY(\"id\" AUTOINCREMENT)\n" +
		");";

	initDatabase() {
		appDatabase.exec(this.createProductsTable);
		appDatabase.exec(this.createBranchesTable);
		appDatabase.exec(this.createReleasesTable);
	}
}