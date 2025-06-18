import 'dotenv/config';
import express, { Express, Request, Response } from "express";
import { limiter } from "./middlewares/limiter";
import helmet from 'helmet';
import cors from 'cors';
import reqLogger from './middlewares/reqLogger';
import { globalErrorHandler } from './middlewares/errorHandler';

const PORT = process.env.PORT || 3000;
const app: Express = express();

// Middleware
app.use(cors());
app.use(reqLogger);
app.use(helmet());
app.use(express.json());
app.use(limiter(10 * 60 * 1000, 100)); // Apply rate limiting middleware
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.use(globalErrorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});