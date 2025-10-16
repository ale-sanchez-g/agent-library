// spec: API_TEST_PLAN.md
// Test Cases: TC-047, TC-048

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Rate Limiting', () => {
  
  test.skip('TC-047: Rate Limiting - Exceeds Limit', async ({ request }) => {
    const requests = [];
    
    for (let i = 0; i < 101; i++) {
      requests.push(request.get(`${BASE_URL}/api/users`));
    }
    
    const responses = await Promise.all(requests);
    
    const rateLimited = responses.some(r => r.status() === 429);
    
    expect(rateLimited).toBe(true);
  });

  test.skip('TC-048: Rate Limiting - Reset Window', async ({ request }) => {
    for (let i = 0; i < 101; i++) {
      await request.get(`${BASE_URL}/api/users`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 15 * 60 * 1000 + 5000));
    
    const response = await request.get(`${BASE_URL}/api/users`);
    expect(response.status()).toBe(200);
  });
});
