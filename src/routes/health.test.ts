import request from 'supertest';

import app from '../app';

describe('GET /health', () => {
  it('should return 200', (done) => {
    request(app)
      .get('/health')
      .expect('Content-Type', /text/)
      .expect(200, done);
  });
});
