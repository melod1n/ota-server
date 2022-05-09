export class OtaError extends Error {
    code?: number;
    message: string;

    constructor(code?: number, message?: string) {
        super(message);
        this.code = code;
        this.message = message;
    }
}

export class IllegalSecretError {
    code = 228;
    message = 'secretCode is invalid';
}