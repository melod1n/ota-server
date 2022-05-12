/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars */
import {ExpressErrorMiddlewareInterface, Middleware} from "routing-controllers";
import {OtaResponse} from "../base/response";

@Middleware({type: "after"})
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
	error(error: any, request: any, response: any, next: (err?: any) => any) {
		return OtaResponse.error(error);
	}
}