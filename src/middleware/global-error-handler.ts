import {ExpressErrorMiddlewareInterface, Middleware} from 'routing-controllers';

@Middleware({type: 'after'})
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: Error, request?: any, response?: any) {
        // response.send({error: error});
        return {error: error};
    }
}

export class Error {
    code: number;
    message?: string;
}