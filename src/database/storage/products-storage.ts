import {Product} from '../../model/db-models';
import {BaseStorage} from './base-storage';

export class ProductsStorage extends BaseStorage<Product> {

    tableName = 'products';

    getAll(): Promise<Product[]> {
        return new Promise((resolve, reject) => {
            let products: Product[] = [];

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

    store(name: string): Promise<any> {
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

    delete(name: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.exec(`delete from ${this.tableName} where name = "${name}"`, (error) => {
                    if (error) reject(error);
                    else resolve(null);
                });
            });
        });
    }

    clear(): Promise<any> {
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
