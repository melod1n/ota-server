import {Body, Delete, Get, HeaderParam, JsonController, Param, Patch, Post} from "routing-controllers";
import "reflect-metadata";
import {Branch} from "../model/db-models";
import {appDatabase} from "../database/database";
import {BranchesStorage} from "../database/storage/branches-storage";
import {BaseController} from "./base-controller";
import {otaSecretCode} from "../index";
import {EntityNotFoundError, IllegalSecretError} from "../base/errors";
import {OtaResponse} from "../base/response";

@JsonController("/branches")
export class BranchesController extends BaseController {

	private branchesStorage = new BranchesStorage(appDatabase);

	@Get("/")
	async getBranches(@HeaderParam("Secret-Code") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			const branches = await this.branchesStorage.getAll();

			return OtaResponse.success({branches: branches});
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Post("/")
	async addBranch(@Body() branch: Branch, @HeaderParam("Secret-Code") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			await this.branchesStorage.insert(branch.productId, branch.name);

			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Patch("/:id")
	async updateBranch(
		@Param("id") id: number,
		@Body() body: any,
		@HeaderParam("Secret-Code") secretCode: string
	) {
		try {
			this.checkSecretValidity(secretCode);
			const branch = await this.branchesStorage.getById(id);
			if (branch == null) {
				throw new EntityNotFoundError("Branch");
			}

			await this.branchesStorage.update(id, body.name);

			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Delete("/:id")
	async deleteBranch(@Param("id") id: number, @HeaderParam("Secret-Code") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			await this.branchesStorage.delete(id);

			return OtaResponse.success();
		} catch (e) {
			return OtaResponse.error(e);
		}
	}

	@Delete("/")
	async clearBranches(@HeaderParam("Secret-Code") secretCode: string) {
		try {
			this.checkSecretValidity(secretCode);
			await this.branchesStorage.clear();

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