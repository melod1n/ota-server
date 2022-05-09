import {ExpressErrorMiddlewareInterface, Middleware} from "routing-controllers";

@Middleware({type: "after"})
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
	// eslint-disable-next-line @typescript-eslint/no-empty-function,@typescript-eslint/no-unused-vars
	error(error: never, request: never, response: never, next: (err?: never) => unknown): void {
	}

	// error(error: Error, request?: any, response?: any) {
	// 	// response.send({error: error});
	// 	return {error: error};
	// }
}

export class Error {
	code: number;
	message?: string;
}