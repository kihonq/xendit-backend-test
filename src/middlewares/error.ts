import type { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-json-errors';

import logger from '../services/logger';

const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof HttpError) {
    logger.error(error.body);
    res.status(error.statusCode).send(error.body);
  } else {
    logger.error(error);
    res.status(500).send({
      error_code: 'SERVER_ERROR',
      message: 'Unknown error',
    });
  }
};

export default errorMiddleware;
