import supertest from 'supertest';
import app from '../index';

describe('indexSpec.js', () => {
  const request = supertest(app);
  describe('/api', () => {
    it('should return 200 when requesting /api', () => {
      request.get('/api').expect(200);
    });
  });
});
