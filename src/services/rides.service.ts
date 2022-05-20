import { Request } from 'express';
import { NotFound } from 'http-json-errors';

import Ride from '../entities/ride.entity';
import rideRepo from '../entities/ride.repo';
import {
  paginateResponse,
  serializeRideInput,
  serializeRidesQuery,
} from '../helpers/rides.helper';

export const createRide = (body: Record<string, string | number>) => {
  const {
    startLat,
    startLong,
    endLat,
    endLong,
    riderName,
    driverName,
    driverVehicle,
  } = serializeRideInput(body);

  const ride = new Ride();
  ride.startLat = startLat;
  ride.startLong = startLong;
  ride.endLat = endLat;
  ride.endLong = endLong;
  ride.riderName = riderName;
  ride.driverName = driverName;
  ride.driverVehicle = driverVehicle;

  return rideRepo.save(ride);
};

export const getRides = async (query: Request['query']) => {
  const { where, order, limit, page, skip } = serializeRidesQuery(query);

  const data = await rideRepo.findAndCount({
    where,
    order,
    skip,
    take: limit,
  });

  return paginateResponse(data, page, limit);
};

export const getRideByID = async (id: number) => {
  const ride = await rideRepo.findOneBy({ rideID: id });
  if (!ride) {
    throw new NotFound({
      body: {
        error_code: 'RIDES_NOT_FOUND_ERROR',
        message: 'Could not find any rides',
      },
    });
  }

  return ride;
};
