import SQLite from 'sqlite3';

export const appDatabase = new SQLite.Database('data/database.sqlite');