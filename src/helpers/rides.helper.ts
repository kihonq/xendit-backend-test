import type { Request } from 'express';
import { BadRequest } from 'http-json-errors';
import { Like } from 'typeorm';

import Ride from '../entities/ride.entity';

const SortValue = {
  date: 'created',
  rider: 'riderName',
  driver: 'driverName',
  vehicle: 'driverVehicle',
};

export const getSortKey = (querySort?: Request['query']['sort']) => {
  if (
    typeof querySort !== 'string' ||
    !querySort ||
    !Object.keys(SortValue).includes(
      querySort.startsWith('-') ? querySort.substring(1) : querySort,
    )
  ) {
    return { created: 'DESC' as const };
  }

  if (querySort.startsWith('-')) {
    return {
      [SortValue[querySort.substring(1) as keyof typeof SortValue]]:
        'DESC' as const,
    };
  }

  return { [SortValue[querySort as keyof typeof SortValue]]: 'ASC' as const };
};

export const paginateResponse = (
  result: [Ride[], number],
  page: number,
  limit: number,
) => {
  const [data, count] = result;
  const lastPage = Math.ceil(count / limit) || 1;
  const nextPage = page + 1 > lastPage ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;
  return {
    data,
    count,
    currentPage: page,
    nextPage,
    prevPage,
    lastPage,
  };
};

export const serializeRidesQuery = (query: Request['query']) => {
  const where =
    typeof query.keyword === 'string'
      ? [
          { riderName: Like(`%${query.keyword}%`) },
          { driverName: Like(`%${query.keyword}%`) },
          { driverVehicle: Like(`%${query.keyword}%`) },
        ]
      : undefined;
  const order = getSortKey(query.sort);
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  return {
    where,
    order,
    limit,
    page,
    skip,
  };
};

export const serializeRideInput = (body: Request['body']) => {
  const startLat = Number(body.start_lat);
  const startLong = Number(body.start_long);
  const endLat = Number(body.end_lat);
  const endLong = Number(body.end_long);
  const riderName = body.rider_name;
  const driverName = body.driver_name;
  const driverVehicle = body.driver_vehicle;

  if (startLat < -90 || startLat > 90 || startLong < -180 || startLong > 180) {
    throw new BadRequest({
      body: {
        error_code: 'VALIDATION_ERROR',
        message:
          'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      },
    });
  }

  if (endLat < -90 || endLat > 90 || endLong < -180 || endLong > 180) {
    throw new BadRequest({
      body: {
        error_code: 'VALIDATION_ERROR',
        message:
          'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      },
    });
  }

  if (typeof riderName !== 'string' || riderName.length < 1) {
    throw new BadRequest({
      body: {
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      },
    });
  }

  if (typeof driverName !== 'string' || driverName.length < 1) {
    throw new BadRequest({
      body: {
        error_code: 'VALIDATION_ERROR',
        message: 'Driver name must be a non empty string',
      },
    });
  }

  if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
    throw new BadRequest({
      body: {
        error_code: 'VALIDATION_ERROR',
        message: `Driver's vehicle must be a non empty string`,
      },
    });
  }

  return {
    startLat,
    startLong,
    endLat,
    endLong,
    riderName,
    driverName,
    driverVehicle,
  };
};
