import 'reflect-metadata';

import bodyParser from 'body-parser';
import express from 'express';

import AppDataSource from './db';
import errorMiddleware from './middlewares/error.middleware';
import healthRouter from './routes/health.route';
import ridesRouter from './routes/rides.route';
import logger from './services/logger.service';

const app = express();

AppDataSource.initialize().catch((error) => logger.error(error));

const port = 8010;

// Before Middlewares
app.use(bodyParser.json());

// Routes
app.use('/health', healthRouter);
app.use('/rides', ridesRouter);

// After Middlewares
app.use(errorMiddleware);

if (require.main === module) {
  app.listen(port, () =>
    logger.info(`App started and listening on port ${port}`),
  );
}

export default app;
