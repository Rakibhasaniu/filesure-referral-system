import request from 'supertest';
import app from '../../../app';
import { connectDatabase, clearDatabase, closeDatabase } from '../../../tests/setup';

describe('Dashboard Module', () => {
  let referrerToken: string;
  let referrerUserId: string;
  let referralCode: string;

  beforeAll(async () => {
    await connectDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create referrer
    const referrerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Rakib',
        email: 'rakib@example.com',
        password: 'password123',
      });

    referrerToken = referrerResponse.body.data.accessToken;
    referrerUserId = referrerResponse.body.data.user.id;
    referralCode = referrerResponse.body.data.user.referralCode;
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('GET /api/v1/dashboard/stats', () => {
    it('should get dashboard stats with no referrals', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        totalReferredUsers: 0,
        convertedUsers: 0,
        totalCreditsEarned: 0,
        referralLink: expect.stringContaining(referralCode),
        referralCode: referralCode,
        referrals: [],
      });
    });

    it('should show pending referral (not yet purchased)', async () => {
      // Create referred user (no purchase)
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Sohag',
          email: 'sohag@example.com',
          password: 'password123',
          referralCode: referralCode,
        });

      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalReferredUsers).toBe(1);
      expect(response.body.data.convertedUsers).toBe(0);
      expect(response.body.data.totalCreditsEarned).toBe(0);
      expect(response.body.data.referrals[0].status).toBe('pending');
      expect(response.body.data.referrals[0].email).toBe('sohag@example.com');
    });

    it('should show converted referral after purchase', async () => {
      // Create referred user
      const referredResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Sohag',
          email: 'sohag@example.com',
          password: 'password123',
          referralCode: referralCode,
        });

      const referredToken = referredResponse.body.data.accessToken;

      // Make purchase
      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({
          productName: 'Premium Template',
          amount: 15,
        });

      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalReferredUsers).toBe(1);
      expect(response.body.data.convertedUsers).toBe(1); // Converted!
      expect(response.body.data.totalCreditsEarned).toBe(2);
      expect(response.body.data.referrals[0].status).toBe('converted');
      expect(response.body.data.referrals[0].convertedAt).toBeDefined();
    });

    it('should handle multiple referrals (mixed pending and converted)', async () => {
      // Create 3 referred users
      const referred1 = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 1',
          email: 'user1@example.com',
          password: 'password123',
          referralCode: referralCode,
        });

      const referred2 = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 2',
          email: 'user2@example.com',
          password: 'password123',
          referralCode: referralCode,
        });

      const referred3 = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 3',
          email: 'user3@example.com',
          password: 'password123',
          referralCode: referralCode,
        });

      // Only User 1 and User 2 make purchases
      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referred1.body.data.accessToken}`)
        .send({ productName: 'Template 1', amount: 15 });

      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referred2.body.data.accessToken}`)
        .send({ productName: 'Template 2', amount: 20 });

      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalReferredUsers).toBe(3);
      expect(response.body.data.convertedUsers).toBe(2); // User 1 and 2
      expect(response.body.data.totalCreditsEarned).toBe(4); // 2 credits per conversion
      expect(response.body.data.referrals.length).toBe(3);

      // Count statuses
      const pending = response.body.data.referrals.filter(
        (r: any) => r.status === 'pending'
      ).length;
      const converted = response.body.data.referrals.filter(
        (r: any) => r.status === 'converted'
      ).length;

      expect(pending).toBe(1); // User 3
      expect(converted).toBe(2); // User 1 and 2
    });

    it('should return correct referral link format', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.referralLink).toMatch(
        /^http:\/\/localhost:3000\/register\?r=[A-Z]{4}\d{3}$/
      );
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should order referrals by most recent first', async () => {
      // Create 3 users with slight delays
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 1',
          email: 'user1@example.com',
          password: 'password123',
          referralCode: referralCode,
        });

      await new Promise(resolve => setTimeout(resolve, 100));

      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 2',
          email: 'user2@example.com',
          password: 'password123',
          referralCode: referralCode,
        });

      await new Promise(resolve => setTimeout(resolve, 100));

      await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'User 3',
          email: 'user3@example.com',
          password: 'password123',
          referralCode: referralCode,
        });

      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.referrals[0].email).toBe('user3@example.com'); // Most recent
      expect(response.body.data.referrals[1].email).toBe('user2@example.com');
      expect(response.body.data.referrals[2].email).toBe('user1@example.com'); // Oldest
    });
  });

  describe('Dashboard Stats Accuracy', () => {
    it('should accurately calculate totalReferredUsers', async () => {
      // Create 5 referred users
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/v1/auth/register')
          .send({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            password: 'password123',
            referralCode: referralCode,
          });
      }

      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(response.body.data.totalReferredUsers).toBe(5);
    });

    it('should accurately calculate convertedUsers', async () => {
      // Create 5 users, but only 3 make purchases
      const tokens: string[] = [];

      for (let i = 1; i <= 5; i++) {
        const userResponse = await request(app)
          .post('/api/v1/auth/register')
          .send({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            password: 'password123',
            referralCode: referralCode,
          });
        tokens.push(userResponse.body.data.accessToken);
      }

      // Only first 3 make purchases
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/v1/purchases')
          .set('Authorization', `Bearer ${tokens[i]}`)
          .send({ productName: `Template ${i + 1}`, amount: 15 });
      }

      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(response.body.data.totalReferredUsers).toBe(5);
      expect(response.body.data.convertedUsers).toBe(3);
      expect(response.body.data.totalCreditsEarned).toBe(6); // 2 credits × 3 conversions
    });
  });
});
