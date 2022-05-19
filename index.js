const port = 8010;

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');
const logger = require('./src/services/logger');
const route = require('./src/app');

db.serialize(() => {
  buildSchemas(db);

  const app = route(db);

  app.use(jsonParser);
  app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});
