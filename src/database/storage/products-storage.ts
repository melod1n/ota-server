import {BaseStorage} from "./base-storage";
import {Product} from "../../model/products";

export class ProductsStorage extends BaseStorage<Product> {

	tableName = "products";

	getAll(): Promise<Product[]> {
		return new Promise((resolve, reject) => {
			const products: Product[] = [];

			this.db.serialize(() => {
				this.db.each(`select * from ${this.tableName}`, (err, row) => {
					products.push(row);
				}, (error) => {
					if (error) reject(error);
					else resolve(products);
				});
			});
		});
	}

	getById(id: number): Promise<Product | null> {
		return new Promise((resolve, reject) => {
			let product: Product | null = null;

			this.db.serialize(() => {
				this.db.each(`select * from ${this.tableName} where id = (?)`, [id], (error, row) => {
					product = row;
				}, (error) => {
					if (error) {
						console.error(error);
						reject(error);
					} else resolve(product);
				});
			});
		});
	}

	insert(name: string): Promise<never> {
		return new Promise((resolve, reject) => {
			this.db.serialize(() => {
				const values = this.db.prepare(`insert or replace into ${this.tableName}(name) values(?)`);
				values.run(name);
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

	delete(name: string): Promise<never> {
		return new Promise((resolve, reject) => {
			this.db.serialize(() => {
				this.db.exec(`delete from ${this.tableName} where name = "${name}"`, (error) => {
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
