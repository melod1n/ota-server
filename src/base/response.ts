import {OtaError} from './errors';

export class OtaResponse<T> {
    response?: T | any;
    error?: OtaError;

    constructor(response?: T | any, error?: OtaError) {
        this.response = response;
        this.error = error;
    }

    static success<T>(response?: T | any): OtaResponse<T> {
        if (response == null) response = {success: true};
        return new OtaResponse<T>(response);
    }

    static error(error: OtaError): OtaResponse<any> {
        return new OtaResponse<any>(null, error);
    }
}