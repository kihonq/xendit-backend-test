import AppDataSource from '../db';
import Ride from './ride.entity';

const rideRepo = AppDataSource.getRepository(Ride);

export default rideRepo;
