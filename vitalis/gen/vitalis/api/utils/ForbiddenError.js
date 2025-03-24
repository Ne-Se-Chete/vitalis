export class ForbiddenError extends Error {
    constructor(message = "You don't have permission to access this resource") {
        super(message);
        this.name = "ForbiddenError";
        this.stack = (new Error()).stack;
    }
}
