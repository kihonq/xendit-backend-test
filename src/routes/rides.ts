import express, { Request } from 'express';
import { BadRequest, NotFound } from 'http-json-errors';
import { Like } from 'typeorm';

import AppDataSource from '../db';
import Ride from '../entities/Ride';

const ridesRouter = express.Router();
export const rideRepo = AppDataSource.getRepository(Ride);

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
  const lastPage = Math.ceil(count / limit);
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

ridesRouter.post('/', async (req, res, next) => {
  try {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (
      startLatitude < -90 ||
      startLatitude > 90 ||
      startLongitude < -180 ||
      startLongitude > 180
    ) {
      throw new BadRequest({
        body: {
          error_code: 'VALIDATION_ERROR',
          message:
            'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        },
      });
    }

    if (
      endLatitude < -90 ||
      endLatitude > 90 ||
      endLongitude < -180 ||
      endLongitude > 180
    ) {
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

    const ride = new Ride();
    ride.startLat = req.body.start_lat;
    ride.startLong = req.body.start_long;
    ride.endLat = req.body.end_lat;
    ride.endLong = req.body.end_long;
    ride.riderName = req.body.rider_name;
    ride.driverName = req.body.driver_name;
    ride.driverVehicle = req.body.driver_vehicle;

    const saved = await rideRepo.save(ride);

    res.send(saved);
  } catch (error) {
    next(error);
  }
});

ridesRouter.get('/', async ({ query }, res, next) => {
  try {
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

    const data = await rideRepo.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    const rides = paginateResponse(data, page, limit);

    res.send(rides);
  } catch (error) {
    next(error);
  }
});

ridesRouter.get('/:id', async (req, res, next) => {
  try {
    const rideID = Number(req.params.id);

    const ride = await rideRepo.findOneBy({ rideID });
    if (!ride) {
      throw new NotFound({
        body: {
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        },
      });
    }

    res.send(ride);
  } catch (error) {
    next(error);
  }
});

export default ridesRouter;
