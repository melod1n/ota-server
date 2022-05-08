import {Body, Delete, Get, JsonController, Param, Post, QueryParam} from 'routing-controllers';
import 'reflect-metadata';
import {Branch} from '../model/db-models';
import {appDatabase} from '../database/database';
import {BranchesStorage} from '../database/storage/branches-storage';
import {BaseController} from './base-controller';

@JsonController()
export class BranchesController extends BaseController {

    private branchesStorage = new BranchesStorage(appDatabase);

    @Get('/branches')
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

    @Post('/branches')
    async addBranch(@Body() branch: Branch) {
        try {
            await this.branchesStorage.store(branch.productId, branch.name);
            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }

    @Delete('/branches/:id')
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

    @Delete('/branches')
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