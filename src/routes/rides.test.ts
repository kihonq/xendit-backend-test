import { createSandbox, SinonSandbox } from 'sinon';
import request from 'supertest';
import { expect } from 'chai';
import { Like } from 'typeorm';

import app from '../app';
import { getSortKey, paginateResponse, rideRepo } from './rides';
import Ride from '../entities/Ride';

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

  it('should return empty list', (done) => {
    sandbox.stub(rideRepo, 'findAndCount').returns(Promise.resolve([[], 0]));
    request(app)
      .get('/rides')
      .expect('Content-Type', /json/)
      .expect({
        data: [],
        count: 0,
        currentPage: 1,
        nextPage: null,
        prevPage: null,
        lastPage: 0,
      })
      .expect(200, done);
  });

  it('should return paginated list of rides', (done) => {
    const mockCreatedDate = '2022-05-19T18:40:19.000Z';
    sandbox
      .stub(rideRepo, 'findAndCount')
      .returns(
        Promise.resolve([
          [{ ...mockRide, rideID: 1, created: new Date(mockCreatedDate) }],
          1,
        ]),
      );

    request(app)
      .get('/rides')
      .expect('Content-Type', /json/)
      .expect({
        data: [{ ...mockRide, rideID: 1, created: mockCreatedDate }],
        count: 1,
        currentPage: 1,
        nextPage: null,
        prevPage: null,
        lastPage: 1,
      })
      .expect(200, done);
  });

  it('should have been called with correct pagination params', async () => {
    const stubbedFinder = sandbox.stub(rideRepo, 'findAndCount');
    const mockPage = 4;
    const mockLimit = 3;
    const mockQuery = {
      page: mockPage,
      limit: mockLimit,
      keyword: 'mock keyword',
      sort: '-rider',
    };
    const expectedArgs = {
      where: [
        { riderName: Like(`%mock keyword%`) },
        { driverName: Like(`%mock keyword%`) },
        { driverVehicle: Like(`%mock keyword%`) },
      ],
      skip: (mockPage - 1) * mockLimit,
      take: mockLimit,
      order: { riderName: 'DESC' },
    };

    await request(app).get('/rides').query(mockQuery);

    expect(stubbedFinder).to.have.been.calledWith(expectedArgs);
  });

  it('should sort with correct key', async () => {
    const correctSortKey = getSortKey('rider');
    expect(correctSortKey).to.deep.equal({ riderName: 'ASC' });
    const wrongSortKey = getSortKey('wrongKey');
    expect(wrongSortKey).to.deep.equal({ created: 'DESC' });
    const ascSort = getSortKey('driver');
    expect(ascSort).to.deep.equal({ driverName: 'ASC' });
    const descSort = getSortKey('-driver');
    expect(descSort).to.deep.equal({ driverName: 'DESC' });
  });

  it('should return correct paginated response', async () => {
    const mockCreatedDate = '2022-05-19T18:40:19.000Z';
    const mockRides: Ride[] = Array.from({ length: 10 }).map((_, i) => ({
      ...mockRide,
      rideID: i + 1,
      created: new Date(mockCreatedDate),
    }));
    const mockResult: [Ride[], number] = [mockRides, mockRides.length];
    const response = paginateResponse(mockResult, 4, 2);

    expect(response).to.deep.equal({
      data: mockRides,
      count: mockRides.length,
      currentPage: 4,
      nextPage: 5,
      prevPage: 3,
      lastPage: 5,
    });
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
