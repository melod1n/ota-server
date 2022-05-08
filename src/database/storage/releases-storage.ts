import {BaseStorage} from './base-storage';
import {Release} from '../../model/db-models';

export class ReleasesStorage extends BaseStorage<Release> {

    tableName = 'releases';

    getAll(): Promise<Release[]> {
        return new Promise((resolve, reject) => {
            let releases: Release[] = [];

            this.db.serialize(() => {
                this.db.each(`select * from ${this.tableName}`, (err, row) => {
                    releases.push(row);
                }, (error) => {
                    if (error) reject(error);
                    else resolve(releases);
                });
            });
        });
    }

    getById(id: number): Promise<Release | null> {
        return new Promise((resolve, reject) => {
            let release: Release | null = null;
            this.db.serialize(() => {
                this.db.each(`select * from ${this.tableName} where id = "${id}"`, (error, row) => {
                    release = row;
                }, (error) => {
                    if (error) reject(error);
                    else resolve(release);
                });
            });
        });
    }

    store(release: Release): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                const values = this.db.prepare(`insert or replace into ${this.tableName}(productId, branchId, mandatory, changelog, enabled, fileName, date, versionCode, versionName) values(?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                values.run(
                    release.productId,
                    release.branchId,
                    release.mandatory,
                    release.changelog,
                    release.enabled,
                    release.fileName,
                    release.date,
                    release.versionCode,
                    release.versionName
                );
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