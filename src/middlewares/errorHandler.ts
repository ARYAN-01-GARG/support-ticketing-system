import {  Request , Response , NextFunction } from "express";
import { APIError } from "../types/apiError";
import logger from "./logger";

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const globalErrorHandler = (err : Error | APIError , req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message); // Log the error message
    if(err instanceof APIError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message
        })
    } else if (err.name === 'ValidationError') {
        res.status(400).json({
            success: false,
            error: "Validation Error"
        });
    } else {
        res.status(500).json({
            success: false,
            error: `Internal Server Error`
        });
    }
};

export { asyncHandler , globalErrorHandler };