export class NewsApiError extends Error{
    constructor(
        message: string,
        public readonly statusCode: number | null,
        public readonly errorCode: string | null,
        public readonly retryAfter: string | null = null
    ){
        super(message)
        this.name = "NewsapiError"
        Object.setPrototypeOf(this, new.target.prototype);
    }
}