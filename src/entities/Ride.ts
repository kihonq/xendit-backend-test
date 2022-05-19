import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
class Ride {
  @PrimaryGeneratedColumn()
  rideID: number;

  @Column('double')
  startLat: number;

  @Column('double')
  startLong: number;

  @Column('double')
  endLat: number;

  @Column('double')
  endLong: number;

  @Column()
  riderName: string;

  @Column()
  driverName: string;

  @Column()
  driverVehicle: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created: Date;
}

export default Ride;
