import express, {Express} from "express";
import log4js from "log4js";
import env from "dotenv";

import {useExpressServer} from "routing-controllers";
import {ProductsController} from "./controller/products-controller";
import bodyParser from "body-parser";
import httpContext from "express-http-context";
import {GlobalErrorHandler} from "./middleware/global-error-handler";
import {BranchesController} from "./controller/branches-controller";
import {appDatabase, DatabaseManager} from "./database/database";
import {ReleasesController} from "./controller/releases-controller";
import path from "path";

import {ReleasesStorage} from "./database/storage/releases-storage";
import {writeFile} from "fs/promises";
import child_process from "child_process";
import localtunnel from "localtunnel";

env.config();

export let baseUrl = "";

export function setBaseUrl(url: string) {
	baseUrl = url;
}

const logger = log4js.getLogger();
logger.level = "ALL";

export const port = Number.parseInt(process.env["PORT"]);
export const otaSecretCode = process.env["SECRET_CODE"];

export const app: Express = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(httpContext.middleware);
app.use("/static", express.static(path.join(process.cwd(), "files")));

export function getReleaseDownloadLink(fileName: string): string {
	return `${baseUrl}/static/releases/${fileName}`;
}

useExpressServer(app, {
	controllers: [ProductsController, BranchesController, ReleasesController],
	middlewares: [GlobalErrorHandler],
	defaultErrorHandler: false
});

app.get("/releases/download/:fileName", (req, res, next) => {
	const fileName = req.params.fileName;

	res.download(`files/releases/${fileName}`, (err) => {
		console.error(err);
	});
	next();
});

app.use((req, res) => {
	httpContext.ns.bindEmitter(req);
	httpContext.ns.bindEmitter(res);
});

const dbManager = new DatabaseManager();
dbManager.initDatabase();

const releasesStorage = new ReleasesStorage(appDatabase);

app.listen(port, async () => {
	console.log(`Running on port ${port}`);

	const tunnel = await localtunnel({port: process.env["PORT"]});
	tunnel.on("close", () => {
		console.log("localtunnel closed port");
	});

	const url = tunnel.url;
	console.log(url);
	setBaseUrl(url);

	await writeFile("ngrok_url.json", JSON.stringify({url: url}));

	const releases = await releasesStorage.getAll();

	for (let i = 0; i < releases.length; i++) {
		const release = releases[i];
		release.downloadLink = getReleaseDownloadLink(release.fileName);
	}

	await releasesStorage.updateAll(releases);

	child_process.exec("start cmd /k commit_and_push_ngrok_url");
});
