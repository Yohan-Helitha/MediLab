/**
 * Run this test file with:
 * npm test -- src/modules/admin/__tests__/admin.users.integration.test.js
 */

import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import { connectDB } from '../../../config/db.js';

// Import models FIRST (ensures schema registration)
import HealthOfficer from '../../auth/healthOfficer.model.js';

// Import app AFTER models
import app from '../../../app.js';

jest.setTimeout(30000);

function adminToken() {
  return jwt.sign(
    {
      id: 'admin-auth-id',
      profileId: 'admin-profile-id',
      userType: 'healthOfficer',
      role: 'Admin',
      fullName: 'Admin User',
    },
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    { expiresIn: '7d' },
  );
}

function staffToken(role = 'Staff') {
  return jwt.sign(
    {
      id: 'staff-auth-id',
      profileId: 'staff-profile-id',
      userType: 'healthOfficer',
      role,
      fullName: 'Staff User',
    },
    process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    { expiresIn: '7d' },
  );
}

describe('Admin Users Integration Tests', () => {
  const createdIds = [];

  beforeAll(async () => {
    await connectDB();

    const year = new Date().getFullYear();
    const stamp = `${Date.now()}${Math.floor(Math.random() * 10000)}`;

    const docs = await HealthOfficer.create([
      {
        fullName: `Admin One ${Date.now()}`,
        gender: 'OTHER',
        contactNumber: '0712345678',
        email: `admin.one.${Date.now()}@test.com`,
        role: 'Admin',
        employeeId: `HO-${year}-${stamp}-001`,
        username: `admin.one.${Date.now()}@test.com`,
        passwordHash: 'hash',
        isActive: true,
      },
      {
        fullName: `MOH One ${Date.now()}`,
        gender: 'MALE',
        contactNumber: '0712345679',
        email: `moh.one.${Date.now()}@test.com`,
        role: 'MOH',
        employeeId: `HO-${year}-${stamp}-002`,
        username: `moh.one.${Date.now()}@test.com`,
        passwordHash: 'hash',
        isActive: true,
      },
      {
        fullName: `Inactive Staff ${Date.now()}`,
        gender: 'FEMALE',
        contactNumber: '0712345680',
        email: `inactive.staff.${Date.now()}@test.com`,
        role: 'Staff',
        employeeId: `HO-${year}-${stamp}-003`,
        username: `inactive.staff.${Date.now()}@test.com`,
        passwordHash: 'hash',
        isActive: false,
      },
    ]);

    docs.forEach((d) => createdIds.push(d._id));
  });

  afterAll(async () => {
    try {
      if (createdIds.length) {
        await HealthOfficer.deleteMany({ _id: { $in: createdIds } });
      }

      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    } catch (error) {
      console.warn('Cleanup error:', error.message);
    }
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('rejects non-admin staff', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${staffToken('Staff')}`);

    expect(res.status).toBe(403);
  });

  it('lists active staff (All roles) for admin', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    // should include active ones, exclude inactive
    const emails = res.body.items.map((u) => u.email);
    expect(emails.some((e) => e && e.includes('inactive.staff'))).toBe(false);
  });

  it('filters users by role', async () => {
    const res = await request(app)
      .get('/api/admin/users?role=MOH')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    for (const row of res.body.items) {
      expect(row.role).toBe('MOH');
    }
  });
});
