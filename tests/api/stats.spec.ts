// spec: API_TEST_PLAN.md
// Test Cases: TC-037 to TC-039

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Statistics Endpoint', () => {
  
  test('TC-037: Get Statistics - Success', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/stats`);
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('totalUsers');
    expect(body).toHaveProperty('totalPosts');
    expect(body).toHaveProperty('averageAge');
    expect(body).toHaveProperty('postsPerUser');
    
    expect(typeof body.totalUsers).toBe('number');
    expect(typeof body.totalPosts).toBe('number');
    expect(typeof body.averageAge).toBe('number');
    expect(typeof body.postsPerUser).toBe('number');
    
    expect(body.totalUsers).toBeGreaterThanOrEqual(0);
    expect(body.totalPosts).toBeGreaterThanOrEqual(0);
    expect(body.averageAge).toBeGreaterThanOrEqual(0);
    expect(body.postsPerUser).toBeGreaterThanOrEqual(0);
  });

  test('TC-038: Get Statistics - Empty Database', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/stats`);
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('totalUsers');
    expect(body).toHaveProperty('totalPosts');
  });

  test('TC-039: Get Statistics - After CRUD Operations', async ({ request }) => {
    let response = await request.get(`${BASE_URL}/api/stats`);
    const initialStats = await response.json();
    
    const newUser = {
      name: 'Stats Test User',
      email: `statstest${Date.now()}@example.com`,
      age: 35
    };
    const createUserResponse = await request.post(`${BASE_URL}/api/users`, {
      data: newUser
    });
    const createdUser = await createUserResponse.json();
    
    response = await request.get(`${BASE_URL}/api/stats`);
    let updatedStats = await response.json();
    expect(updatedStats.totalUsers).toBe(initialStats.totalUsers + 1);
    
    const newPost = {
      title: 'Stats Test Post',
      content: 'Testing statistics',
      authorId: createdUser.id
    };
    await request.post(`${BASE_URL}/api/posts`, {
      data: newPost
    });
    
    response = await request.get(`${BASE_URL}/api/stats`);
    updatedStats = await response.json();
    expect(updatedStats.totalPosts).toBe(initialStats.totalPosts + 1);
    
    await request.delete(`${BASE_URL}/api/users/${createdUser.id}`);
    
    response = await request.get(`${BASE_URL}/api/stats`);
    const finalStats = await response.json();
    expect(finalStats.totalUsers).toBe(initialStats.totalUsers);
  });
});
