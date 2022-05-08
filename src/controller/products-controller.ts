import {Body, Delete, Get, JsonController, Post, QueryParam} from 'routing-controllers';
import 'reflect-metadata';
import {Product} from '../model/db-models';
import {ProductsStorage} from '../database/storage/products-storage';
import {appDatabase} from '../database/database';

@JsonController()
export class ProductsController {

    private productsStorage = new ProductsStorage(appDatabase);

    @Get('/products.get')
    async getProducts() {
        try {
            let products = await this.productsStorage.getAll();
            return {
                response: {
                    products: products
                }
            };
        } catch (e) {
            return e;
        }
    }

    @Post('/products.add')
    async addProduct(@Body() product: Product) {
        try {
            await this.productsStorage.store(product.name);
            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }

    @Delete('/products.delete')
    async deleteProduct(@QueryParam('name') name: string) {
        try {
            await this.productsStorage.delete(name);
            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }

    @Delete('/products.clear')
    async clearProducts() {
        try {
            await this.productsStorage.clear();
            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }

    // @Get('/testing.check')
    // @ContentType('application/json')
    // checkUserTesting(@QueryParams() params) {
    //     const userId = utils.requireNumber('userId', params.userId);
    //     if (typeof userId !== 'number') return userId;
    //
    //     const users = database.getTestUsers();
    //
    //     return {inTesting: users.includes(<number>userId)};
    // }
    //
    // @Get('/testing.add')
    // @ContentType('application/json')
    // setUserTesting(@QueryParams() params) {
    //     const userId = utils.requireNumber('userId', params.userId);
    //     if (typeof userId !== 'number') return userId;
    //
    //     if (params.access_token !== process.env.TOKEN) return utils.error(1, 'Wrong token');
    //
    //     database.setUserTesting(<number>userId);
    //
    //     return {success: 1};
    // }

}