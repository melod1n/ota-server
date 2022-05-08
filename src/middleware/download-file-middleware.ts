import {ExpressMiddlewareInterface, Middleware} from 'routing-controllers';

@Middleware({type: 'after'})
export class DownloadFileMiddleware implements ExpressMiddlewareInterface {

    use(request: any, response: any, next: (err?: any) => any): any {

        next();
    }

}