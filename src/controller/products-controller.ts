import {Body, Delete, Get, HeaderParam, JsonController, Param, Patch, Post} from "routing-controllers";
import "reflect-metadata";
import {ProductsStorage} from "../database/storage/products-storage";
import {appDatabase} from "../database/database";
import {BaseController} from "./base-controller";
import {otaSecretCode} from "../index";
import {EntityNotFoundError, IllegalSecretError} from "../base/errors";
import {OtaResponse} from "../base/response";
import {ProductAdd, ProductEdit} from "../model/products";

@JsonController("/products")
export class ProductsController extends BaseController {

	private productsStorage = new ProductsStorage(appDatabase);

	@Get("/")
	async getProducts(@HeaderParam("Secret-Code") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			const products = await this.productsStorage.getAll();
			return OtaResponse.success({products: products});
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Post("/")
	async addProduct(
		@Body() product: ProductAdd,
		@HeaderParam("Secret-Code") secretCode: string
	) {
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
		@Body() body: ProductEdit,
		@HeaderParam("Secret-Code") secretCode: string
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
	async deleteProduct(
		@Param("name") name: string,
		@HeaderParam("Secret-Code") secretCode: string
	) {
		try {
			this.checkSecretValidity(secretCode);
			await this.productsStorage.delete(name);

			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Delete("/")
	async clearProducts(@HeaderParam("Secret-Code") secretCode: string) {
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