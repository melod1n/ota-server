export enum ErrorCodes {
    UnknownError = -1,
    InternalError = 1,
    ArgumentNull = 2,
    EntityNotFound = 15,
    IllegalSecret = 16
}

export class OtaError {
    code?: number;
    message: string;

    constructor(code?: number, message?: string) {
        this.code = code;
        this.message = message;
    }
}

export class UnknownError extends OtaError {
    constructor() {
        super(ErrorCodes.UnknownError, 'Unknown error occurred');
    }
}

export class InternalError extends OtaError {
    constructor(trace: string) {
        super(ErrorCodes.InternalError, `Internal error occurred: ${trace}`);
    }
}

export class ArgumentNullError extends OtaError {
    constructor(argumentName: string) {
        super(ErrorCodes.ArgumentNull, `Argument is null: ${argumentName}`);
    }

}

export class EntityNotFoundError extends OtaError {
    constructor(entityName: string) {
        super(ErrorCodes.EntityNotFound, `Entity not found: ${entityName}`);
    }
}

export class IllegalSecretError extends OtaError {
    constructor() {
        super(ErrorCodes.IllegalSecret, 'secretCode is invalid');
    }
}