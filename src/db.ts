import { DataSource } from 'typeorm';
import Ride from './entities/ride.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  dropSchema: true,
  entities: [Ride],
  synchronize: true,
  logging: false,
});

export default AppDataSource;
