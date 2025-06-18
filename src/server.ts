import 'dotenv/config';
import express, { Express, Request, Response } from "express";
import { limiter } from "./middlewares/limiter";
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import ticketsRoutes from './routes/ticketsRoutes';
import userRoutes from './routes/userRoutes';
import reqLogger from './middlewares/reqLogger';
import { globalErrorHandler } from './middlewares/errorHandler';
import { connectToDB } from './configs/prisma';
import path from 'path';
import pagesRoutes from './routes/pagesRoutes';

const PORT = process.env.PORT || 3000;
const app: Express = express();

connectToDB();

// Middleware
app.use(cors());
app.use(reqLogger);
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(limiter(10 * 60 * 1000, 100));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.render('home/home');
});

app.use('/auth',authRoutes);
app.use('/tickets', ticketsRoutes);
app.use('/', userRoutes);
app.use('/', pagesRoutes);

app.use(globalErrorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});