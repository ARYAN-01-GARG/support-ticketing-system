class APIError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = "APIError";
    }
}

export { APIError };