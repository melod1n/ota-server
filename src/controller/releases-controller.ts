import {Body, Delete, Get, JsonController, Param, Post, Res, UploadedFile} from 'routing-controllers';
import 'reflect-metadata';
import {Release} from '../model/db-models';
import {appDatabase} from '../database/database';
import {ReleasesStorage} from '../database/storage/releases-storage';
import {createWriteStream} from 'fs';

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
    async addRelease(@Body() release: Release, @UploadedFile('file') file: any) {
        try {
            const mappedFile = UploadedFileExpress.map(file);

            release.date = new Date().getTime();
            release.fileName = mappedFile.originalName;

            await this.releasesStorage.store(release);
            createWriteStream(`files/releases/${file.originalname}`).write(mappedFile.buffer);
            return {
                response: 1
            };
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