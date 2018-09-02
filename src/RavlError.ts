export default class RavlError extends Error {
    description: string;
    context: string | undefined;

    constructor(description: string, context?: string) {
        super(`\ndescription: ${description}\ncontext: ${context || 'n/a'}`);
        Object.setPrototypeOf(this, RavlError.prototype);
        // this.name = (this.constructor as any).name;
        this.description = description;
        this.context = context;
        Error.captureStackTrace(this, this.constructor);
    }
}
