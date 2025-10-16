// spec: API_TEST_PLAN.md
// Test Cases: TC-051 to TC-055

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Performance Testing', () => {
  
  test('TC-051: Response Time - Health Check', async ({ request }) => {
    const times: number[] = [];
    
    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      const response = await request.get(`${BASE_URL}/health`);
      const end = Date.now();
      
      expect(response.status()).toBe(200);
      times.push(end - start);
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = times.sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    console.log(`Health check - Average: ${avg.toFixed(2)}ms, 95th percentile: ${p95}ms`);
    
    expect(avg).toBeLessThan(50);
    expect(p95).toBeLessThan(100);
  });

  test('TC-052: Response Time - Get Users', async ({ request }) => {
    const times: number[] = [];
    
    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      const response = await request.get(`${BASE_URL}/api/users`);
      const end = Date.now();
      
      expect(response.status()).toBe(200);
      times.push(end - start);
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = times.sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    console.log(`Get users - Average: ${avg.toFixed(2)}ms, 95th percentile: ${p95}ms`);
    
    expect(avg).toBeLessThan(200);
    expect(p95).toBeLessThan(500);
  });

  test('TC-053: Response Time - Create User', async ({ request }) => {
    const times: number[] = [];
    
    for (let i = 0; i < 100; i++) {
      const user = {
        name: `Perf Test ${i}`,
        email: `perftest${Date.now()}_${i}@example.com`,
        age: 25
      };
      
      const start = Date.now();
      const response = await request.post(`${BASE_URL}/api/users`, {
        data: user
      });
      const end = Date.now();
      
      expect(response.status()).toBe(201);
      times.push(end - start);
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    
    console.log(`Create user - Average: ${avg.toFixed(2)}ms`);
    
    expect(avg).toBeLessThan(300);
  });

  test('TC-054: Concurrent Requests', async ({ request }) => {
    const requests = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 50; i++) {
      requests.push(request.get(`${BASE_URL}/api/users`));
    }
    
    const responses = await Promise.all(requests);
    const endTime = Date.now();
    
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    const totalTime = endTime - startTime;
    console.log(`50 concurrent requests completed in ${totalTime}ms`);
    
    expect(totalTime).toBeLessThan(5000);
  });

  test('TC-055: Database Connection Pooling', async ({ request }) => {
    const requests = [];
    
    for (let i = 0; i < 100; i++) {
      requests.push(request.get(`${BASE_URL}/api/users`));
    }
    
    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
  });
});
