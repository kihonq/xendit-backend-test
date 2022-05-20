import { expect } from 'chai';
import { createSandbox, SinonSandbox } from 'sinon';
import type { Request } from 'express';
import { Like } from 'typeorm';
import { NotFound } from 'http-json-errors';

import rideRepo from '../entities/ride.repo';
import * as rideHelper from '../helpers/rides.helper';

import { createRide, getRideByID, getRides } from './rides.service';

describe('Ride services', () => {
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

  it('should create a ride', async () => {
    const stubbedRepo = sandbox.stub(rideRepo, 'save');
    sandbox.stub(rideHelper, 'serializeRideInput').returns(mockRide);

    await createRide({});
    expect(stubbedRepo).to.be.called;
  });

  it('should have been called with correct pagination query', async () => {
    const stubbedFinder = sandbox.stub(rideRepo, 'findAndCount');
    sandbox.stub(rideHelper, 'paginateResponse').alwaysReturned({});

    await getRides({});
    expect(stubbedFinder).to.have.called;
  });

  it('should have been called with correct pagination query', async () => {
    const stubbedFinder = sandbox.stub(rideRepo, 'findAndCount');
    sandbox.stub(rideHelper, 'paginateResponse').alwaysReturned({});

    const mockPage = '4';
    const mockLimit = '3';
    const mockQuery: Request['query'] = {
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
      skip: (+mockPage - 1) * +mockLimit,
      take: +mockLimit,
      order: { riderName: 'DESC' },
    };

    await getRides(mockQuery);

    expect(stubbedFinder).to.have.been.calledWith(expectedArgs);
  });

  it('should return a ride', async () => {
    const mockID = 1;
    const expectedResult = { ...mockRide, rideID: mockID, created: new Date() };
    const stubbedRepo = sandbox
      .stub(rideRepo, 'findOneBy')
      .returns(Promise.resolve(expectedResult));

    const result = await getRideByID(mockID);
    expect(stubbedRepo).to.be.calledWith({ rideID: mockID });
    expect(result).to.be.deep.eq(expectedResult);
  });

  it('should throw NotFound when not exist', async () => {
    const mockID = 1;
    sandbox.stub(rideRepo, 'findOneBy').returns(Promise.resolve(null));

    try {
      await getRideByID(mockID);
    } catch (error) {
      expect(error).to.be.instanceOf(NotFound);
    }
  });
});
