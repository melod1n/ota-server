import {BaseStorage} from './base-storage';
import {Branch} from '../../model/db-models';

export class BranchesStorage extends BaseStorage<Branch> {

    tableName = 'branches';

    getAll(): Promise<Branch[]> {
        return new Promise((resolve, reject) => {
            let products: Branch[] = [];

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

    store(productId: number, name: string): Promise<any> {
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

    delete(id: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.exec(`delete from ${this.tableName} where id = "${id}"`, (error) => {
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