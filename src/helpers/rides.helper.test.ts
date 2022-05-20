import { expect } from 'chai';
import { BadRequest } from 'http-json-errors';
import { Request } from 'express';
import { Like } from 'typeorm';

import Ride from '../entities/ride.entity';
import {
  getSortKey,
  paginateResponse,
  serializeRideInput,
  serializeRidesQuery,
} from './rides.helper';

describe('Ride helpers', () => {
  const mockRide = {
    startLat: -10,
    startLong: -179,
    endLat: 90,
    endLong: 179,
    riderName: 'Pak Leman',
    driverName: 'Pak Doyok',
    driverVehicle: 'Beemer',
  };
  const mockBody = {
    start_lat: mockRide.startLat,
    start_long: mockRide.startLong,
    end_lat: mockRide.endLat,
    end_long: mockRide.endLong,
    rider_name: mockRide.riderName,
    driver_name: mockRide.driverName,
    driver_vehicle: mockRide.driverVehicle,
  };

  it('should sort with correct key', () => {
    const correctSortKey = getSortKey('rider');
    expect(correctSortKey).to.deep.equal({ riderName: 'ASC' });
    const wrongSortKey = getSortKey('wrongKey');
    expect(wrongSortKey).to.deep.equal({ created: 'DESC' });
    const ascSort = getSortKey('driver');
    expect(ascSort).to.deep.equal({ driverName: 'ASC' });
    const descSort = getSortKey('-driver');
    expect(descSort).to.deep.equal({ driverName: 'DESC' });
  });

  it('should return correct paginated response', () => {
    const empty = paginateResponse([[], 0], 1, 10);

    expect(empty).to.deep.equal({
      data: [],
      count: 0,
      currentPage: 1,
      nextPage: null,
      prevPage: null,
      lastPage: 1,
    });

    const mockRides: Ride[] = Array.from({ length: 10 });
    const mockResult: [Ride[], number] = [Array.from({ length: 10 }), 10];
    const fivePages = paginateResponse(mockResult, 4, 2);

    expect(fivePages).to.deep.equal({
      data: mockRides,
      count: mockRides.length,
      currentPage: 4,
      nextPage: 5,
      prevPage: 3,
      lastPage: 5,
    });
  });

  it('should return serialized ride input and no error', () => {
    const responseOK = serializeRideInput(mockBody);
    expect(responseOK).to.deep.equal(mockRide);
  });

  it('should return serialized rides query', () => {
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
      order: { riderName: 'DESC' },
      skip: (+mockPage - 1) * +mockLimit,
      limit: +mockLimit,
      page: +mockPage,
    };

    const responseOK = serializeRidesQuery(mockQuery);
    expect(responseOK).to.deep.equal(expectedArgs);
  });

  it('should throw BadRequest for invalid start lat and long', () => {
    expect(() => serializeRideInput({ ...mockBody, start_lat: -100 })).to.throw(
      BadRequest,
    );
    expect(() => serializeRideInput({ ...mockBody, start_long: 300 })).to.throw(
      BadRequest,
    );
  });

  it('should throw BadRequest for invalid end lat and long', () => {
    expect(() => serializeRideInput({ ...mockBody, end_lat: -100 })).to.throw(
      BadRequest,
    );
    expect(() => serializeRideInput({ ...mockBody, end_long: 300 })).to.throw(
      BadRequest,
    );
  });

  it('should throw BadRequest for empty riderName, driverName and driverVehicle', () => {
    expect(() => serializeRideInput({ ...mockBody, rider_name: '' })).to.throw(
      BadRequest,
    );
    expect(() => serializeRideInput({ ...mockBody, driver_name: '' })).to.throw(
      BadRequest,
    );
    expect(() =>
      serializeRideInput({ ...mockBody, driver_vehicle: '' }),
    ).to.throw(BadRequest);
  });
});
