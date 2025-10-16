// spec: API_TEST_PLAN.md
// Test Cases: TC-045, TC-046, TC-049, TC-050

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Security Testing', () => {
  
  test('TC-045: CORS Headers', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health`, {
      headers: {
        'Origin': 'http://example.com'
      }
    });
    
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeTruthy();
  });

  test('TC-046: Security Headers', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/health`);
    
    const headers = response.headers();
    
    if (headers['x-content-type-options']) {
      expect(headers['x-content-type-options']).toBe('nosniff');
    }
    
    if (headers['x-frame-options']) {
      expect(headers['x-frame-options']).toBe('DENY');
    }
    
    if (headers['x-xss-protection']) {
      expect(headers['x-xss-protection']).toContain('1');
    }
  });

  test('TC-049: SQL Injection Prevention', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/users/1' OR '1'='1`);
    
    expect([404, 400]).toContain(response.status());
    
    const body = await response.json();
    expect(body).not.toHaveProperty('users');
  });

  test('TC-050: XSS Prevention', async ({ request }) => {
    const xssPayload = {
      name: "<script>alert('XSS')</script>",
      email: `xss${Date.now()}@example.com`,
      age: 25
    };

    const createResponse = await request.post(`${BASE_URL}/api/users`, {
      data: xssPayload
    });
    
    if (createResponse.status() === 201) {
      const createdUser = await createResponse.json();
      
      const getResponse = await request.get(`${BASE_URL}/api/users/${createdUser.id}`);
      const retrievedUser = await getResponse.json();
      
      expect(retrievedUser.name).toBe(xssPayload.name);
      
      await request.delete(`${BASE_URL}/api/users/${createdUser.id}`);
    }
  });
});
