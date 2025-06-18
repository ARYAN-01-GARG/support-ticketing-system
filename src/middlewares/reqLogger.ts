import { Request , Response , NextFunction } from 'express';
import logger from './logger';

const reqLogger = (req: Request, res: Response, next: NextFunction) => {
    const timeStamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const userAgent = req.get('User-Agent');
    const ip = req.ip;
    logger.info(`[${timeStamp}] ${method} ${url} - ${userAgent} - IP: ${ip}`);
    next();
};

export default reqLogger;