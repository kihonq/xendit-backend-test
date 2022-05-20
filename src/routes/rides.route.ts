import express from 'express';

import { createRide, getRideByID, getRides } from '../services/rides.service';

const ridesRouter = express.Router();

ridesRouter.post('/', async (req, res, next) => {
  try {
    const createdRide = await createRide(req.body);
    res.send(createdRide);
  } catch (error) {
    next(error);
  }
});

ridesRouter.get('/', async (req, res, next) => {
  try {
    const paginatedRides = await getRides(req.query);
    res.send(paginatedRides);
  } catch (error) {
    next(error);
  }
});

ridesRouter.get('/:id', async (req, res, next) => {
  try {
    const ride = await getRideByID(Number(req.params.id));
    res.send(ride);
  } catch (error) {
    next(error);
  }
});

export default ridesRouter;
