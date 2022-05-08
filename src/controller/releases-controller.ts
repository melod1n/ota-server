import {Body, Delete, Get, JsonController, Param, Patch, Post, Res, UploadedFile} from 'routing-controllers';
import 'reflect-metadata';
import {appDatabase} from '../database/database';
import {ReleasesStorage} from '../database/storage/releases-storage';
import {createWriteStream, existsSync, renameSync, unlinkSync} from 'fs';
import md5File from 'md5-file';
import {ReleaseAdd, ReleaseEdit} from '../model/releases';

@JsonController('/releases')
export class ReleasesController {

    private releasesStorage = new ReleasesStorage(appDatabase);

    @Get('/')
    async getReleases() {
        try {
            let releases = await this.releasesStorage.getAll();
            return {
                response: {
                    releases: releases
                }
            };
        } catch (e) {
            return e;
        }
    }

    @Get('/:id')
    async getReleaseById(@Param('id') id: number) {
        try {
            const release = await this.releasesStorage.getById(id);

            return {
                response: {
                    release: release
                }
            };
        } catch (e) {
            return e;
        }
    }

    @Get('/:id/download')
    async downloadFile(@Param('id') id: number, @Res() res) {
        try {
            const release = await this.releasesStorage.getById(id);
            if (release == null) {
                return {
                    error: 'Release not found'
                };
            }

            res.download(`files/releases/${release.fileName}`, (err) => {
                if (err) {
                    console.error(err);
                    return {
                        error: err
                    };
                }
            });
        } catch (e) {
            return e;
        }
    }

    @Post('/')
    async addRelease(@Body() body: ReleaseAdd, @UploadedFile('file') file: any, @Res() res) {
        try {
            const release = body.mapToRelease();
            release.date = new Date().getTime();

            const mappedFile = UploadedFileExpress.map(file);
            const lastDotIndex = mappedFile.originalName.lastIndexOf('.');
            const extension =
                lastDotIndex == -1 ? ''
                    : mappedFile.originalName.substring(lastDotIndex + 1);

            release.extension = extension;
            release.originalName = mappedFile.originalName;
            release.fileSize = mappedFile.size;
            release.mimeType = mappedFile.mimeType;
            release.encoding = mappedFile.encoding;

            const path = `files/releases`;
            const filePath = `${path}/${mappedFile.originalName}`;

            createWriteStream(filePath).write(mappedFile.buffer, (error => {
                if (error) throw error;
                else {
                    md5File(filePath).then(async (hash) => {
                        renameSync(filePath, `${path}/${hash}.${extension}`);
                        release.fileName = hash;
                        await this.releasesStorage.insert(release);
                    });
                }
            }));

            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }

    @Patch('/:id')
    async editReleaseById(
        @Param('id') id: number,
        @Body() body: ReleaseEdit,
        @UploadedFile('file') file: any,
        @Res() res
    ) {
        try {
            const release = await this.releasesStorage.getById(id);
            if (release == null) {
                return {
                    error: 'Release not found'
                };
            }

            body.applyToRelease(release);

            const path = `files/releases`;
            let filePath = `${path}/${release.fileName}.${release.extension}`;

            if (existsSync(filePath)) {
                unlinkSync(filePath);
            }

            if (file == null) {
                await this.releasesStorage.update(release);
                return {
                    response: 1
                };
            } else {
                const mappedFile = UploadedFileExpress.map(file);
                const lastDotIndex = mappedFile.originalName.lastIndexOf('.');
                const extension =
                    lastDotIndex == -1 ? ''
                        : mappedFile.originalName.substring(lastDotIndex + 1);

                release.extension = extension;
                release.originalName = mappedFile.originalName;
                release.fileSize = mappedFile.size;
                release.mimeType = mappedFile.mimeType;
                release.encoding = mappedFile.encoding;

                filePath = `${path}/${mappedFile.originalName}`;

                const writeStream = createWriteStream(filePath);
                writeStream.write(mappedFile.buffer, (error => {
                    if (error) throw error;
                    else {
                        md5File(filePath).then(async (hash) => {
                            renameSync(filePath, `${path}/${hash}.${extension}`);
                            release.fileName = hash;
                            await this.releasesStorage.update(release);
                        });
                    }
                }));

                return {
                    response: 1
                };
            }
        } catch (e) {
            return e;
        }
    }

    @Delete('/:id')
    async deleteReleaseById(@Param('id') id: number) {
        try {
            await this.releasesStorage.delete(id);
            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }

    @Delete('/')
    async clearReleases() {
        try {
            await this.releasesStorage.clear();
            return {
                response: 1
            };
        } catch (e) {
            return e;
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