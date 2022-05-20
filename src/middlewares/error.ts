import type { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-json-errors';

import logger from '../services/logger';

const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!error) {
    next();
  } else if (error instanceof HttpError) {
    res.status(error.statusCode).send(error.body);
    logger.error(error.body);
  } else {
    res.status(500).send({
      error_code: 'SERVER_ERROR',
      message: 'Unknown error',
    });
    logger.error(error);
  }
};

export default errorMiddleware;
