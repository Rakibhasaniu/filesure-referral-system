import request from 'supertest';
import app from '../../../app';
import { connectDatabase, clearDatabase, closeDatabase } from '../../../tests/setup';
import { User } from '../User/user.model';
import { Referral } from '../Referral/referral.model';

describe('Purchase Module', () => {
  let referrerToken: string;
  let referredToken: string;
  let referrerUserId: string;
  let referredUserId: string;
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
        name: 'Referrer User',
        email: 'referrer@example.com',
        password: 'password123',
      });

    if (!referrerResponse.body.data) {
      throw new Error(`Registration failed: ${JSON.stringify(referrerResponse.body)}`);
    }

    referrerToken = referrerResponse.body.data.accessToken;
    referrerUserId = referrerResponse.body.data.user.id;
    referralCode = referrerResponse.body.data.user.referralCode;

    // Create referred user
    const referredResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Referred User',
        email: 'referred@example.com',
        password: 'password123',
        referralCode: referralCode,
      });

    referredToken = referredResponse.body.data.accessToken;
    referredUserId = referredResponse.body.data.user.id;
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/v1/purchases', () => {
    it('should create purchase and award credits on first purchase', async () => {
      const response = await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({
          productName: 'Premium Template',
          amount: 15,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isFirstPurchase).toBe(true);

      // Check buyer credits
      const buyer = await User.findOne({ id: referredUserId });
      expect(buyer?.credits).toBe(2);
      expect(buyer?.hasPurchased).toBe(true);

      // Check referrer credits
      const referrer = await User.findOne({ id: referrerUserId });
      expect(referrer?.credits).toBe(2);

      // Check referral status
      const referral = await Referral.findOne({
        referrer: referrer?._id,
        referred: buyer?._id,
      });
      expect(referral?.status).toBe('converted');
      expect(referral?.creditAwarded).toBe(true);
    });

    it('should not award credits on second purchase', async () => {
      // First purchase
      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({
          productName: 'Template 1',
          amount: 15,
        });

      // Second purchase
      const response = await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({
          productName: 'Template 2',
          amount: 20,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.isFirstPurchase).toBe(false);

      // Credits should still be 2 (not 4)
      const buyer = await User.findOne({ id: referredUserId });
      expect(buyer?.credits).toBe(2);

      const referrer = await User.findOne({ id: referrerUserId });
      expect(referrer?.credits).toBe(2);
    });

    it('should create purchase without referrer (direct user)', async () => {
      // Register user without referral
      const directResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Direct User',
          email: 'direct@example.com',
          password: 'password123',
        });

      const directToken = directResponse.body.data.accessToken;
      const directUserId = directResponse.body.data.user.id;

      const response = await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${directToken}`)
        .send({
          productName: 'Template',
          amount: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.isFirstPurchase).toBe(true);

      // Only buyer gets credits (2), no referrer
      const buyer = await User.findOne({ id: directUserId });
      expect(buyer?.credits).toBe(2);
    });

    it('should use default values if not provided', async () => {
      const response = await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({}); // Empty body

      expect(response.status).toBe(201);
      expect(response.body.data.productName).toBe('Digital Product');
      expect(response.body.data.amount).toBe(10);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/purchases')
        .send({
          productName: 'Template',
          amount: 15,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/purchases/my-purchases', () => {
    beforeEach(async () => {
      // Create some purchases
      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({
          productName: 'Template 1',
          amount: 15,
        });

      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({
          productName: 'Template 2',
          amount: 20,
        });
    });

    it('should get user purchase history', async () => {
      const response = await request(app)
        .get('/api/v1/purchases/my-purchases')
        .set('Authorization', `Bearer ${referredToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].productName).toBe('Template 2'); // Most recent first
      expect(response.body.data[1].productName).toBe('Template 1');
    });

    it('should return empty array for user with no purchases', async () => {
      const response = await request(app)
        .get('/api/v1/purchases/my-purchases')
        .set('Authorization', `Bearer ${referrerToken}`); // Referrer has no purchases

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/purchases/my-purchases');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Credit Reward Logic', () => {
    it('should award 2 credits to buyer on first purchase', async () => {
      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({
          productName: 'Template',
          amount: 15,
        });

      const buyer = await User.findOne({ id: referredUserId });
      expect(buyer?.credits).toBe(2);
      expect(buyer?.hasPurchased).toBe(true);
    });

    it('should award 2 credits to referrer when referred user purchases', async () => {
      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({
          productName: 'Template',
          amount: 15,
        });

      const referrer = await User.findOne({ id: referrerUserId });
      expect(referrer?.credits).toBe(2);
      expect(referrer?.hasPurchased).toBe(false); // Referrer hasn't purchased
    });

    it('should update referral status to converted', async () => {
      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({
          productName: 'Template',
          amount: 15,
        });

      const referrer = await User.findOne({ id: referrerUserId });
      const buyer = await User.findOne({ id: referredUserId });

      const referral = await Referral.findOne({
        referrer: referrer?._id,
        referred: buyer?._id,
      });

      expect(referral?.status).toBe('converted');
      expect(referral?.creditAwarded).toBe(true);
      expect(referral?.convertedAt).toBeDefined();
    });

    it('should prevent double-crediting', async () => {
      // First purchase
      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({ productName: 'Template 1', amount: 15 });

      // Second purchase
      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({ productName: 'Template 2', amount: 20 });

      // Third purchase
      await request(app)
        .post('/api/v1/purchases')
        .set('Authorization', `Bearer ${referredToken}`)
        .send({ productName: 'Template 3', amount: 25 });

      const buyer = await User.findOne({ id: referredUserId });
      const referrer = await User.findOne({ id: referrerUserId });

      // Still only 2 credits each
      expect(buyer?.credits).toBe(2);
      expect(referrer?.credits).toBe(2);
    });
  });
});
