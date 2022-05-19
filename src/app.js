const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const logger = require('./services/logger');

module.exports = (db) => {
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (
      startLatitude < -90
      || startLatitude > 90
      || startLongitude < -180
      || startLongitude > 180
    ) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message:
          'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      };
      logger.error(error);
      return res.send(error);
    }

    if (
      endLatitude < -90
      || endLatitude > 90
      || endLongitude < -180
      || endLongitude > 180
    ) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message:
          'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      };
      logger.error(error);
      return res.send(error);
    }

    if (typeof riderName !== 'string' || riderName.length < 1) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      };
      logger.error(error);
      return res.send(error);
    }

    if (typeof driverName !== 'string' || driverName.length < 1) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      };
      logger.error(error);
      return res.send(error);
    }

    if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      const error = {
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      };
      logger.error(error);
      return res.send(error);
    }

    const values = [
      req.body.start_lat,
      req.body.start_long,
      req.body.end_lat,
      req.body.end_long,
      req.body.rider_name,
      req.body.driver_name,
      req.body.driver_vehicle,
    ];

    return db.run(
      'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)',
      values,
      (err) => {
        if (err) {
          const error = {
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          };
          logger.error(error);
          return res.send(error);
        }

        return db.all(
          'SELECT * FROM Rides WHERE rideID = ?',
          this.lastID,
          (dbErr, rows) => {
            if (dbErr) {
              const error = {
                error_code: 'SERVER_ERROR',
                message: 'Unknown error',
              };
              logger.error(error);
              return res.send(error);
            }

            return res.send(rows);
          },
        );
      },
    );
  });

  app.get('/rides', (req, res) => {
    db.all('SELECT * FROM Rides', (err, rows) => {
      if (err) {
        const error = {
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        };
        logger.error(error);
        return res.send(error);
      }

      if (rows.length === 0) {
        const error = {
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        };
        logger.error(error);
        return res.send(error);
      }

      return res.send(rows);
    });
  });

  app.get('/rides/:id', (req, res) => {
    db.all(
      `SELECT * FROM Rides WHERE rideID='${req.params.id}'`,
      (err, rows) => {
        if (err) {
          const error = {
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          };
          logger.error(error);
          return res.send(error);
        }

        if (rows.length === 0) {
          const error = {
            error_code: 'RIDES_NOT_FOUND_ERROR',
            message: 'Could not find any rides',
          };
          logger.error(error);
          return res.send(error);
        }

        return res.send(rows);
      },
    );
  });

  return app;
};
