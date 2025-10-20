/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './app/config/swagger';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import { generalLimiter } from './app/middlewares/rateLimiter';
import router from './app/routes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize()); // Sanitize data against NoSQL injection

//parsers
app.use(express.json({ limit: '10mb' })); // Body limit to prevent large payloads
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }),
);

app.use('/api/', generalLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('FileSure Referral System API - Visit /api-docs for documentation');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;
