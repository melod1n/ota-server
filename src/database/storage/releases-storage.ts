import {BaseStorage} from "./base-storage";
import {Release} from "../../model/releases";

export class ReleasesStorage extends BaseStorage<Release> {

	tableName = "releases";

	getAll(): Promise<Release[]> {
		return new Promise((resolve, reject) => {
			const releases: Release[] = [];

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

	getByParams(where: string, whereArgs: unknown[]): Promise<Release[]> {
		return new Promise((resolve, reject) => {
			const releases: Release[] = [];

			this.db.serialize(() => {
				this.db.each(`select * from ${this.tableName} where ${where}`, whereArgs, (err, row) => {
					releases.push(row);
				}, (error) => {
					if (error) reject(error);
					else resolve(releases);
				});
			});
		});
	}

	insert(release: Release): Promise<never> {
		return new Promise((resolve, reject) => {
			this.db.serialize(() => {
				const values = this.db.prepare(`insert or replace into ${this.tableName}(productId, branchId, mandatory, changelog, enabled, fileName, date, versionCode, versionName, extension, originalName, fileSize, mimeType, encoding, preRelease, downloadLink) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
				values.run(
					release.productId,
					release.branchId,
					release.mandatory,
					release.changelog,
					release.enabled,
					release.fileName,
					release.date,
					release.versionCode,
					release.versionName,
					release.extension,
					release.originalName,
					release.fileSize,
					release.mimeType,
					release.encoding,
					release.preRelease,
					release.downloadLink
				);
				values.finalize(error => {
					if (error) reject(error);
					else resolve(null);
				});
			});
		});
	}

	updateAll(releases: Release[]): Promise<never> {
		return new Promise((resolve, reject) => {
			releases.forEach(async (release) => {
				await this.update(release).catch(reject);
			});

			resolve(null);
		});
	}

	update(release: Release): Promise<never> {
		return new Promise((resolve, reject) => {
			this.db.serialize(() => {
				const sql = `update ${this.tableName} set versionName = (?),
                    versionCode = (?),
                    mandatory = (?), 
                    changelog = (?), 
                    enabled = (?), 
                    extension = (?), 
                    originalName = (?), 
                    fileSize = (?), 
                    mimeType = (?), 
                    encoding = (?), 
                    fileName = (?),
                    preRelease = (?),
                    downloadLink = (?)
                    where id = (?)`;
				this.db.run(
					sql,
					[
						release.versionName,
						release.versionCode,
						release.mandatory,
						release.changelog,
						release.enabled,
						release.extension,
						release.originalName,
						release.fileSize,
						release.mimeType,
						release.encoding,
						release.fileName,
						release.preRelease,
						release.downloadLink,
						release.id
					],
					(error) => {
						if (error) {
							console.error(error);
							reject(error);
						} else resolve(null);
					}
				);
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