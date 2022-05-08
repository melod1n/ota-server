import {Body, Delete, Get, JsonController, Param, Post} from 'routing-controllers';
import 'reflect-metadata';
import {Product} from '../model/db-models';
import {ProductsStorage} from '../database/storage/products-storage';
import {appDatabase} from '../database/database';

@JsonController('/products')
export class ProductsController {

    private productsStorage = new ProductsStorage(appDatabase);

    @Get('/')
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

    @Post('/')
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

    @Delete('/:name')
    async deleteProduct(@Param('name') name: string) {
        try {
            await this.productsStorage.delete(name);
            return {
                response: 1
            };
        } catch (e) {
            return e;
        }
    }

    @Delete('/')
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
}