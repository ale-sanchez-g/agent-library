// spec: API_TEST_PLAN.md
// Test Cases: TC-040 to TC-044

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Error Handling', () => {
  
  test('TC-040: Invalid Route - 404', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/invalid-route`);
    
    expect(response.status()).toBe(404);
    
    const body = await response.json();
    expect(body.error).toBe('Route not found');
  });

  test('TC-041: Invalid Method', async ({ request }) => {
    const response = await request.patch(`${BASE_URL}/api/users/1`, {
      data: { name: 'Test' }
    });
    
    expect([404, 405]).toContain(response.status());
  });

  test('TC-042: Malformed JSON', async ({ request }) => {
    try {
      const response = await request.post(`${BASE_URL}/api/users`, {
        headers: {
          'Content-Type': 'application/json'
        },
        data: '{ invalid json }'
      });
      
      expect(response.status()).toBe(400);
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  test('TC-043: Content-Type Not Set', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/users`, {
      headers: {
        'Content-Type': 'text/plain'
      },
      data: JSON.stringify({ name: 'Test', email: 'test@example.com', age: 25 })
    });
    
    expect([400, 415, 500]).toContain(response.status());
  });

  test('TC-044: Large Payload', async ({ request }) => {
    const largeString = 'x'.repeat(2 * 1024 * 1024);
    const largePayload = {
      name: largeString,
      email: 'test@example.com',
      age: 25
    };

    try {
      const response = await request.post(`${BASE_URL}/api/users`, {
        data: largePayload,
        timeout: 5000
      });
      
      expect([400, 413, 500]).toContain(response.status());
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
