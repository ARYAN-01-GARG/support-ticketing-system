import rateLimit , { RateLimitRequestHandler } from "express-rate-limit";

export const limiter  = ( maxAge : number , maxCount : number ) : RateLimitRequestHandler => {
    return rateLimit({
    windowMs: maxAge,
    limit : maxCount,
    standardHeaders: 'draft-8',
    legacyHeaders: true,
    message: 'Too many requests from this IP, please try again after 10 minutes',
    statusCode: 429,
});
}