import { createSandbox, SinonSandbox } from 'sinon';
import request from 'supertest';
import { expect } from 'chai';

import app from '../app';
import * as rideService from '../services/rides.service';

describe('Ride routes', () => {
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call getRides service', async () => {
    const stubbed = sandbox.stub(rideService, 'getRides');
    await request(app).get('/rides');

    expect(stubbed).to.be.called;
  });

  it('should call getRideByID service', async () => {
    const stubbed = sandbox.stub(rideService, 'getRideByID');

    await request(app).get('/rides/1');
    expect(stubbed).to.be.called;
  });

  it('should call createRide service', async () => {
    const stubbed = sandbox.stub(rideService, 'createRide');

    await request(app).post('/rides');
    expect(stubbed).to.be.called;
  });

  it('should throw 500 if unknown error occurs', async () => {
    sandbox.stub(rideService, 'getRides').throws(new Error());
    sandbox.stub(rideService, 'getRideByID').throws(new Error());
    sandbox.stub(rideService, 'createRide').throws(new Error());
    const serverErrorBody = {
      error_code: 'SERVER_ERROR',
      message: 'Unknown error',
    };

    await request(app)
      .get('/rides')
      .expect('Content-Type', /json/)
      .expect(serverErrorBody)
      .expect(500);
    await request(app)
      .get('/rides/1')
      .expect('Content-Type', /json/)
      .expect(serverErrorBody)
      .expect(500);
    await request(app)
      .post('/rides')
      .expect('Content-Type', /json/)
      .expect(serverErrorBody)
      .expect(500);
  });
});
