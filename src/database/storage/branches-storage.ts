import {BaseStorage} from "./base-storage";
import {Branch} from "../../model/db-models";

export class BranchesStorage extends BaseStorage<Branch> {

	tableName = "branches";

	getAll(): Promise<Branch[]> {
		return new Promise((resolve, reject) => {
			const branches: Branch[] = [];

			this.db.serialize(() => {
				this.db.each(`select * from ${this.tableName}`, (err, row) => {
					branches.push(row);
				}, (error) => {
					if (error) reject(error);
					else resolve(branches);
				});
			});
		});
	}

	getById(id: number): Promise<Branch | null> {
		return new Promise((resolve, reject) => {
			let branch: Branch | null = null;

			this.db.serialize(() => {
				this.db.each(`select * from ${this.tableName} where id = (?)`, [id], (error, row) => {
					branch = row;
				}, (error) => {
					if (error) {
						console.error(error);
						reject(error);
					} else resolve(branch);
				});
			});
		});
	}

	insert(productId: number, name: string): Promise<never> {
		return new Promise((resolve, reject) => {
			this.db.serialize(() => {
				const values = this.db.prepare(`insert or replace into ${this.tableName}(productId, name) values(?, ?)`);
				values.run(productId, name);
				values.finalize(error => {
					if (error) reject(error);
					else resolve(null);
				});
			});
		});
	}

	update(id: number, name: string): Promise<never> {
		return new Promise((resolve, reject) => {
			const sql = `update ${this.tableName} set name = (?) where id = (?)`;
			this.db.run(sql, [name, id], (error) => {
				if (error) {
					console.error(error);
					reject(error);
				} else resolve(null);
			});
		});
	}

	delete(id: number): Promise<never> {
		return new Promise((resolve, reject) => {
			this.db.serialize(() => {
				this.db.exec(`delete from ${this.tableName} where id = "${id}"`, (error) => {
					if (error) reject(error);
					else resolve(null);
				});
			});
		});
	}

	clear(): Promise<never> {
		return new Promise((resolve, reject) => {
			this.db.serialize(() => {
				this.db.exec(`delete from ${this.tableName}`, (error) => {
					if (error) reject(error);
					else resolve(null);
				});
			});
		});
	}
}