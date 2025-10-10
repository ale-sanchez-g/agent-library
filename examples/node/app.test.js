const request = require('supertest');
const app = require('./app');

describe('Express App', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/users', () => {
    it('should return list of users with pagination', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=2')
        .expect(200);
      
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .expect(200);
      
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        age: 25
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newUser.name);
      expect(response.body.email).toBe(newUser.email);
    });

    it('should validate required fields', async () => {
      const invalidUser = {
        name: '',
        email: 'invalid-email',
        age: -1
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidUser)
        .expect(400);
      
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/posts', () => {
    it('should return list of posts with authors', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('author');
      }
    });
  });

  describe('GET /api/stats', () => {
    it('should return user and post statistics', async () => {
      const response = await request(app)
        .get('/api/stats')
        .expect(200);
      
      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalPosts');
      expect(response.body).toHaveProperty('averageAge');
      expect(response.body).toHaveProperty('postsPerUser');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});