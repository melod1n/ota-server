import {app} from '../index';
import {Error, GlobalErrorHandler} from '../middleware/global-error-handler';

const errorHandler = new GlobalErrorHandler();

export class Utils {
    json(params: any) {
        const a = app.response.json(params);
        return a;
    }

    error(code: number, message?: string) {
        return errorHandler.error({code: code, message: message});
    }

    requireNumber(key: string, value?: any): number | any {
        if (!value) return this.error(0, `${key} not specified`);
        if (typeof value !== 'number') {
            value = parseInt(value);

            if (!value) return this.error(0, `${key} must be integer`);
        }

        return value;
    }
}

