import type { Request, Response } from 'express';
import { createSandbox, stub, SinonSandbox, SinonStub } from 'sinon';
import sinonChai from 'sinon-chai';
import { use, expect } from 'chai';
import { HttpError } from 'http-json-errors';

import errorMiddleware from './error';

use(sinonChai);

type StubbedResponse = Partial<Response> & {
  status: SinonStub;
  send: SinonStub;
};

const genMockResponse = () => {
  const res: StubbedResponse = {
    status: stub(),
    send: stub(),
  };

  res.status.returns(res);
  return res;
};

describe('Error middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: StubbedResponse;
  let sandbox: SinonSandbox;
  const nextFunction = stub();

  beforeEach(() => {
    sandbox = createSandbox();
    mockRequest = {};
    mockResponse = genMockResponse();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be fine without error', async () => {
    errorMiddleware(
      undefined,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(nextFunction.called).to.be.true;
  });

  it('should send error body with status code', async () => {
    const mockError = new HttpError({
      statusCode: 400,
      body: {
        error_code: 'BAD_REQUEST',
        message: 'Mock Bad request',
      },
    });

    errorMiddleware(
      mockError,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).to.have.been.calledWith(mockError.statusCode);
    expect(mockResponse.send).to.have.been.calledWith(mockError.body);
  });

  it('should send internal server error body with 500 status', async () => {
    const mockError = new Error('Mock Error');

    errorMiddleware(
      mockError,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.status).to.have.been.calledWith(500);
    expect(mockResponse.send).to.have.been.calledWith({
      error_code: 'SERVER_ERROR',
      message: 'Unknown error',
    });
  });

  // it('without "authorization" header', async () => {
  //   const expectedResponse = {
  //     error: "Missing JWT token from the 'Authorization' header",
  //   };
  //   mockRequest = {
  //     headers: {},
  //   };
  //   errorMiddleware(
  //     mockRequest as Request,
  //     mockResponse as Response,
  //     nextFunction,
  //   );

  //   expect(mockResponse.json).toBeCalledWith(expectedResponse);
  // });

  // it('with "authorization" header', async () => {
  //   mockRequest = {
  //     headers: {
  //       authorization: 'Bearer abc',
  //     },
  //   };
  //   errorMiddleware(
  //     mockRequest as Request,
  //     mockResponse as Response,
  //     nextFunction,
  //   );

  //   expect(nextFunction).toBeCalledTimes(1);
  // });
});
