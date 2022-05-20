import { createSandbox, SinonSandbox } from 'sinon';
import request from 'supertest';

import app from '../app';
import { rideRepo } from './rides';

describe('GET /rides', () => {
  let sandbox: SinonSandbox;

  const mockRide = {
    startLat: -10,
    startLong: -179,
    endLat: 90,
    endLong: 179,
    riderName: 'Pak Leman',
    driverName: 'Pak Doyok',
    driverVehicle: 'Beemer',
  };

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should throw 404 when empty', (done) => {
    sandbox.stub(rideRepo, 'find').returns(Promise.resolve([]));
    request(app)
      .get('/rides')
      .expect('Content-Type', /json/)
      .expect({
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      })
      .expect(404, done);
  });

  it('should return list of rides', (done) => {
    const mockCreatedDate = '2022-05-19T18:40:19.000Z';
    sandbox
      .stub(rideRepo, 'find')
      .returns(
        Promise.resolve([
          { ...mockRide, rideID: 1, created: new Date(mockCreatedDate) },
        ]),
      );

    request(app)
      .get('/rides')
      .expect('Content-Type', /json/)
      .expect([{ ...mockRide, rideID: 1, created: mockCreatedDate }])
      .expect(200, done);
  });

  it('should return a ride by /:id', (done) => {
    const mockCreatedDate = '2022-05-19T18:40:19.000Z';
    const mockRideID = 1;
    sandbox.stub(rideRepo, 'findOneBy').returns(
      Promise.resolve({
        ...mockRide,
        rideID: mockRideID,
        created: new Date(mockCreatedDate),
      }),
    );

    request(app)
      .get(`/rides/${mockRideID}`)
      .expect('Content-Type', /json/)
      .expect({ ...mockRide, rideID: mockRideID, created: mockCreatedDate })
      .expect(200, done);
  });

  it('should return 404 when no ride by /:id', (done) => {
    const mockRideID = 1;
    sandbox.stub(rideRepo, 'findOneBy').returns(Promise.resolve(null));

    request(app)
      .get(`/rides/${mockRideID}`)
      .expect('Content-Type', /json/)
      .expect({
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      })
      .expect(404, done);
  });

  it('should create a ride', (done) => {
    const mockCreatedDate = '2022-05-19T18:40:19.000Z';
    const mockRideID = 1;
    sandbox.stub(rideRepo, 'save').returns(
      Promise.resolve({
        ...mockRide,
        rideID: mockRideID,
        created: new Date(mockCreatedDate),
      }),
    );

    request(app)
      .post('/rides')
      .set('Content-type', 'application/json')
      .send({
        start_lat: mockRide.startLat,
        start_long: mockRide.startLong,
        end_lat: mockRide.endLat,
        end_long: mockRide.endLong,
        rider_name: mockRide.riderName,
        driver_name: mockRide.driverName,
        driver_vehicle: mockRide.driverVehicle,
      })
      .expect({ ...mockRide, rideID: mockRideID, created: mockCreatedDate })
      .expect(200, done);
  });

  it('should return 400 when invalid start latitude and longitude', (done) => {
    const validationError = {
      error_code: 'VALIDATION_ERROR',
      message:
        'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
    };

    // Invalid latitude
    request(app)
      .post('/rides')
      .set('Content-type', 'application/json')
      .send({
        start_lat: -190,
        start_long: -180,
        end_lat: mockRide.endLat,
        end_long: mockRide.endLong,
        rider_name: mockRide.riderName,
        driver_name: mockRide.driverName,
        driver_vehicle: mockRide.driverVehicle,
      })
      .expect(validationError)
      .expect(400, done);
  });

  it('should return 400 when invalid end latitude and longitude', (done) => {
    const validationError = {
      error_code: 'VALIDATION_ERROR',
      message:
        'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
    };

    // Invalid latitude
    request(app)
      .post('/rides')
      .set('Content-type', 'application/json')
      .send({
        start_lat: mockRide.startLat,
        start_long: mockRide.startLong,
        end_lat: -190,
        end_long: -180,
        rider_name: mockRide.riderName,
        driver_name: mockRide.driverName,
        driver_vehicle: mockRide.driverVehicle,
      })
      .expect(validationError)
      .expect(400, done);
  });

  it('should return 400 when rider name is empty', (done) => {
    const validationError = {
      error_code: 'VALIDATION_ERROR',
      message: 'Rider name must be a non empty string',
    };

    // Invalid latitude
    request(app)
      .post('/rides')
      .set('Content-type', 'application/json')
      .send({
        start_lat: mockRide.startLat,
        start_long: mockRide.startLong,
        end_lat: mockRide.endLat,
        end_long: mockRide.endLong,
        rider_name: '',
        driver_name: mockRide.driverName,
        driver_vehicle: mockRide.driverVehicle,
      })
      .expect(validationError)
      .expect(400, done);
  });

  it('should return 400 when driver name is empty', (done) => {
    const validationError = {
      error_code: 'VALIDATION_ERROR',
      message: 'Driver name must be a non empty string',
    };

    // Invalid latitude
    request(app)
      .post('/rides')
      .set('Content-type', 'application/json')
      .send({
        start_lat: mockRide.startLat,
        start_long: mockRide.startLong,
        end_lat: mockRide.endLat,
        end_long: mockRide.endLong,
        rider_name: mockRide.riderName,
        driver_name: '',
        driver_vehicle: mockRide.driverVehicle,
      })
      .expect(validationError)
      .expect(400, done);
  });

  it(`should return 400 when driver's vehicle is empty`, (done) => {
    const validationError = {
      error_code: 'VALIDATION_ERROR',
      message: `Driver's vehicle must be a non empty string`,
    };

    // Invalid latitude
    request(app)
      .post('/rides')
      .set('Content-type', 'application/json')
      .send({
        start_lat: mockRide.startLat,
        start_long: mockRide.startLong,
        end_lat: mockRide.endLat,
        end_long: mockRide.endLong,
        rider_name: mockRide.riderName,
        driver_name: mockRide.driverName,
        driver_vehicle: '',
      })
      .expect(validationError)
      .expect(400, done);
  });
});
