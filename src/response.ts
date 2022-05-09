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

    static error(error: Error): OtaResponse<any> {
        return new OtaResponse<any>(null, error);
    }

    static errorText(code?: number, text?: string): OtaResponse<any> {
        return new OtaResponse<any>(null, new OtaError(-1, text));
    }
}