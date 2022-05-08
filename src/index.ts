import express, {Express} from 'express';
import log4js from 'log4js';
import env from 'dotenv';

import {useExpressServer} from 'routing-controllers';
import {ProductsController} from './controller/products-controller';
import bodyParser from 'body-parser';
import httpContext from 'express-http-context';
import {GlobalErrorHandler} from './middleware/global-error-handler';
import {BranchesController} from './controller/branches-controller';

env.config();

const logger = log4js.getLogger();
logger.level = 'ALL';

const port = 8080;

export const app: Express = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(httpContext.middleware);

useExpressServer(app, {
    controllers: [ProductsController, BranchesController],
    middlewares: [GlobalErrorHandler],
    defaultErrorHandler: false
});

app.use((req, res) => {
    httpContext.ns.bindEmitter(req);
    httpContext.ns.bindEmitter(res);
});

app.listen(port, () => console.log(`Running on port ${port}`));