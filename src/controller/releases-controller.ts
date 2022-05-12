import {
	Body,
	Delete,
	Get,
	HeaderParam,
	JsonController,
	Param,
	Patch,
	Post,
	QueryParam,
	Res,
	UploadedFile
} from "routing-controllers";
import "reflect-metadata";
import {appDatabase} from "../database/database";
import {ReleasesStorage} from "../database/storage/releases-storage";
import {existsSync, renameSync, unlinkSync, writeFileSync} from "fs";
import md5File from "md5-file";
import {Release, ReleaseAdd, ReleaseEdit} from "../model/releases";
import {getReleaseDownloadLink, otaSecretCode} from "../index";
import {ArgumentNullError, EntityNotFoundError, IllegalSecretError, InternalError} from "../base/errors";
import {OtaResponse} from "../base/response";

@JsonController()
export class ReleasesController {

	private releasesStorage = new ReleasesStorage(appDatabase);

	@Get("/releases/")
	async getReleases(@HeaderParam("Secret-Code") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			const releases = await this.releasesStorage.getAll();

			return OtaResponse.success({releases: releases});
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Get("/releases/:id")
	async getReleaseById(@Param("id") id: number, @HeaderParam("Secret-Code") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			const release = await this.releasesStorage.getById(id);

			return OtaResponse.success({release: release});
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Get("/releases-latest")
	async getLatestRelease(
		@QueryParam("productId") productId: number,
		@QueryParam("branchId") branchId: number,
		@HeaderParam("Secret-Code") secretCode: string
	) {
		try {
			this.checkSecretValidity(secretCode);
			const releases = await this.releasesStorage.getByParams(
				"productId = (?) and branchId = (?)",
				[productId, branchId]
			);
			if (releases.length == 0) {
				return OtaResponse.success(null);
			}

			releases.sort((first, second) => {
				return second.date - first.date;
			});

			return OtaResponse.success({release: releases[0]});
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Get("/releases/:id/download")
	async downloadFile(
		@Param("id") id: number,
		@Res() res,
		@HeaderParam("Secret-Code") secretCode: string
	) {
		try {
			this.checkSecretValidity(secretCode);
			const release = await this.releasesStorage.getById(id);
			if (release == null) {
				throw new EntityNotFoundError("Release");
			}

			const filePath = `files/releases/${release.fileName}.${release.extension}`;

			res.download(filePath, (error) => {
				if (error) {
					console.error(error);

					throw new InternalError(error);
				}
			});
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Post("/releases/")
	async addRelease(
		@Body() body: ReleaseAdd,
		@UploadedFile("file") file: any,
		@Res() res,
		@HeaderParam("Secret-Code") secretCode: string
	) {
		try {
			this.checkSecretValidity(secretCode);
			const release = body.mapToRelease();
			release.date = new Date().getTime();

			if (file == null) {
				throw new ArgumentNullError("file");
			}

			const path = "files/releases";
			let filePath = `${path}/${release.fileName}.${release.extension}`;

			if (existsSync(filePath)) {
				unlinkSync(filePath);
			}

			const mappedFile = UploadedFileExpress.map(file);
			const lastDotIndex = mappedFile.originalName.lastIndexOf(".");
			const extension =
				lastDotIndex == -1 ? ""
					: mappedFile.originalName.substring(lastDotIndex + 1);

			release.extension = extension;
			release.originalName = mappedFile.originalName;
			release.fileSize = mappedFile.size;
			release.mimeType = mappedFile.mimeType;
			release.encoding = mappedFile.encoding;

			filePath = `${path}/${mappedFile.originalName}`;

			if (existsSync(filePath)) {
				unlinkSync(filePath);
			}

			writeFileSync(filePath, mappedFile.buffer);

			const hash = md5File.sync(filePath);
			const fullFileName = `${hash}.${extension}`;

			renameSync(filePath, `${path}/${fullFileName}`);

			release.fileName = hash;
			release.downloadLink = getReleaseDownloadLink(fullFileName);

			await this.releasesStorage.insert(release);

			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Patch("/releases/:id")
	async editReleaseById(
		@Param("id") id: number,
		@Body() body: ReleaseEdit,
		@UploadedFile("file") file: any,
		@Res() res,
		@HeaderParam("Secret-Code") secretCode: string
	) {
		try {
			this.checkSecretValidity(secretCode);
			const release = await this.releasesStorage.getById(id);
			if (release == null) {
				throw new EntityNotFoundError("Release");
			}

			body.applyToRelease(release);

			const path = "files/releases";
			let filePath = `${path}/${release.fileName}.${release.extension}`;

			if (existsSync(filePath)) {
				unlinkSync(filePath);
			}

			if (file == null) {
				await this.releasesStorage.update(release);
				return OtaResponse.success();
			} else {
				const mappedFile = UploadedFileExpress.map(file);
				const lastDotIndex = mappedFile.originalName.lastIndexOf(".");
				const extension =
					lastDotIndex == -1 ? ""
						: mappedFile.originalName.substring(lastDotIndex + 1);

				release.extension = extension;
				release.originalName = mappedFile.originalName;
				release.fileSize = mappedFile.size;
				release.mimeType = mappedFile.mimeType;
				release.encoding = mappedFile.encoding;

				filePath = `${path}/${mappedFile.originalName}`;

				writeFileSync(filePath, mappedFile.buffer);

				const hash = md5File.sync(filePath);
				const fullFileName = `${hash}.${extension}`;

				renameSync(filePath, `${path}/${fullFileName}`);

				release.fileName = hash;
				release.downloadLink = getReleaseDownloadLink(fullFileName);

				await this.releasesStorage.update(release);

				return OtaResponse.success();
			}
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Delete("/releases/:id")
	async deleteReleaseById(
		@Param("id") id: number,
		@HeaderParam("Secret-Code") secretCode: string
	) {
		try {
			this.checkSecretValidity(secretCode);
			const release = await this.releasesStorage.getById(id);
			if (release == null) {
				throw new EntityNotFoundError("Release");
			}

			this.deleteFile(release);
			await this.releasesStorage.delete(id);

			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Delete("/releases/")
	async clearReleases(@HeaderParam("Secret-Code") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			const releases = await this.releasesStorage.getAll();
			for (const release of releases) {
				this.deleteFile(release);
			}

			await this.releasesStorage.clear();

			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	deleteFile(release: Release) {
		const path = "files/releases";
		const filePath = `${path}/${release.fileName}.${release.extension}`;

		if (existsSync(filePath)) {
			unlinkSync(filePath);
		}
	}

	checkSecretValidity(secret: string) {
		if (secret !== otaSecretCode) {
			throw new IllegalSecretError();
		}
	}
}

class UploadedFileExpress {
	fieldName: string;
	originalName: string;
	encoding: string;
	mimeType: string;
	buffer: Buffer;
	size: number;

	static map(file: any): UploadedFileExpress {
		const fileExpress = new UploadedFileExpress();
		fileExpress.fieldName = file.fieldname;
		fileExpress.originalName = file.originalname;
		fileExpress.encoding = file.encoding;
		fileExpress.mimeType = file.mimetype;
		fileExpress.buffer = file.buffer;
		fileExpress.size = file.size;

		return fileExpress;
	}
}