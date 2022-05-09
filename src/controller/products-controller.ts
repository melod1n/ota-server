import {Body, Delete, Get, JsonController, Param, Patch, Post, QueryParam} from "routing-controllers";
import "reflect-metadata";
import {Product} from "../model/db-models";
import {ProductsStorage} from "../database/storage/products-storage";
import {appDatabase} from "../database/database";
import {BaseController} from "./base-controller";
import {otaSecretCode} from "../index";
import {EntityNotFoundError, IllegalSecretError} from "../base/errors";
import {OtaResponse} from "../base/response";

@JsonController("/products")
export class ProductsController extends BaseController {

	private productsStorage = new ProductsStorage(appDatabase);

	@Get("/")
	async getProducts(@QueryParam("secretCode") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			let products = await this.productsStorage.getAll();
			return OtaResponse.success({products: products});
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Post("/")
	async addProduct(@Body() product: Product, @QueryParam("secretCode") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			await this.productsStorage.insert(product.name);
			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Patch("/:id")
	async updateProduct(
		@Param("id") id: number,
		@Body() body: any,
		@QueryParam("secretCode") secretCode: string
	) {
		try {
			this.checkSecretValidity(secretCode);
			const product = await this.productsStorage.getById(id);
			if (product == null) {
				throw new EntityNotFoundError("Product");
			}

			await this.productsStorage.update(id, body.name);

			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Delete("/:name")
	async deleteProduct(@Param("name") name: string, @QueryParam("secretCode") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			await this.productsStorage.delete(name);

			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Delete("/")
	async clearProducts(@QueryParam("secretCode") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			await this.productsStorage.clear();

			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	checkSecretValidity(secret: string) {
		if (secret !== otaSecretCode) {
			throw new IllegalSecretError();
		}
	}
}