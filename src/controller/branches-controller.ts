import {Body, Delete, Get, JsonController, Param, Patch, Post} from 'routing-controllers';
import 'reflect-metadata';
import {Branch} from '../model/db-models';
import {appDatabase} from '../database/database';
import {BranchesStorage} from '../database/storage/branches-storage';
import {BaseController} from './base-controller';

@JsonController('/branches')
export class BranchesController extends BaseController {

    private branchesStorage = new BranchesStorage(appDatabase);

    @Get('/')
    async getBranches() {
        try {
            let products = await this.branchesStorage.getAll();
            return {
                response: {
                    branches: products
                }
            };
        } catch (e) {
            return e;
        }
    }

    @Post('/')
    async addBranch(@Body() branch: Branch) {
        try {
            await this.branchesStorage.insert(branch.productId, branch.name);
            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }

    @Patch('/:id')
    async updateBranch(@Param('id') id: number, @Body() body: any) {
        try {
            const branch = await this.branchesStorage.getById(id);
            if (branch == null) {
                return {
                    error: 'Branch not found'
                };
            }

            await this.branchesStorage.update(id, body.name);
            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }

    @Delete('/:id')
    async deleteBranch(@Param('id') id: number) {
        try {
            await this.branchesStorage.delete(id);
            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }

    @Delete('/')
    async clearBranches() {
        try {
            await this.branchesStorage.clear();
            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }
}