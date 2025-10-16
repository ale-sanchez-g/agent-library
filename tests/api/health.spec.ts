// spec: API_TEST_PLAN.md
// Test Cases: TC-001

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Health Check Endpoint', () => {
  test('TC-001: Health Check Success', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get(`${BASE_URL}/health`);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Verify status code
    expect(response.status()).toBe(200);
    
    // Verify response body
    const body = await response.json();
    expect(body).toHaveProperty('status', 'OK');
    expect(body).toHaveProperty('timestamp');
    
    // Verify timestamp is in ISO 8601 format
    const timestamp = new Date(body.timestamp);
    expect(timestamp.toISOString()).toBeTruthy();
    
    // Verify response time
    expect(responseTime).toBeLessThan(100);
    
    console.log(`Health check response time: ${responseTime}ms`);
  });
});
