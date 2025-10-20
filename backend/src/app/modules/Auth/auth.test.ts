import request from 'supertest';
import app from '../../../app';
import { connectDatabase, clearDatabase, closeDatabase } from '../../../tests/setup';
import { User } from '../User/user.model';

describe('Auth Module', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('referralCode');
      expect(response.body.data.user.email).toBe('john@example.com');
    });

    it('should register user with referral code', async () => {
      // Create first user (referrer)
      const referrer = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Referrer',
          email: 'jane@example.com',
          password: 'password123',
        });

      const referralCode = referrer.body.data.user.referralCode;

      // Register second user with referral code
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Referred',
          email: 'john@example.com',
          password: 'password123',
          referralCode: referralCode,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify referredBy is set
      const user = await User.findOne({ email: 'john@example.com' });
      expect(user?.referredBy).toBe(referralCode);
    });

    it('should fail with duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Duplicate',
          email: 'john@example.com',
          password: 'password456',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already registered');
    });

    it('should fail with invalid referral code', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          referralCode: 'INVALID999',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid referral code');
    });

    it('should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          // Missing email and password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: '123', // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should generate unique referral codes', async () => {
      const user1 = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User One',
          email: 'user1@example.com',
          password: 'password123',
        });

      const user2 = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User Two',
          email: 'user2@example.com',
          password: 'password123',
        });

      const code1 = user1.body.data.user.referralCode;
      const code2 = user2.body.data.user.referralCode;

      expect(code1).not.toBe(code2);
      expect(code1).toMatch(/^[A-Z]{4}\d{3}$/); // Format: ABCD123
      expect(code2).toMatch(/^[A-Z]{4}\d{3}$/);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });
    });

    it('should login successfully with correct credentials', async () => {
      const user = await User.findOne({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          id: user?.id,
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('needsPasswordChange');
    });

    it('should fail with incorrect password', async () => {
      const user = await User.findOne({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          id: user?.id,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent user ID', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          id: 'U-999999',
          password: 'password123',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return refresh token in cookie', async () => {
      const user = await User.findOne({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          id: user?.id,
          password: 'password123',
        });

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken');
    });
  });

  describe('GET /api/v1/users/me', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      // Register and login user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        });

      accessToken = registerResponse.body.data.accessToken;
      userId = registerResponse.body.data.user.id;
    });

    it('should get current user info with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(userId);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data).toHaveProperty('referralCode');
      expect(response.body.data).toHaveProperty('credits');
    });

    it('should fail without authorization token', async () => {
      const response = await request(app)
        .get('/api/v1/users/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
