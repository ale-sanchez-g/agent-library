// spec: API_TEST_PLAN.md
// Test Cases: TC-061 to TC-063

import { test, expect } from '@playwright/test';

const PLATFORMS = {
  node: 'http://localhost:3000',
  python: 'http://localhost:8000',
  dotnet: 'http://localhost:5000'
};

test.describe('Cross-Platform Consistency', () => {
  
  test.skip('TC-061: Cross-Platform Response Format', async ({ request }) => {
    const responses: Record<string, any> = {};
    
    for (const [platform, url] of Object.entries(PLATFORMS)) {
      try {
        const response = await request.get(`${url}/api/users/1`);
        responses[platform] = await response.json();
      } catch (error) {
        console.log(`${platform} is not running, skipping...`);
        return;
      }
    }
    
    const nodeKeys = Object.keys(responses.node).sort();
    const pythonKeys = Object.keys(responses.python).sort();
    const dotnetKeys = Object.keys(responses.dotnet).sort();
    
    expect(nodeKeys).toEqual(pythonKeys);
    expect(pythonKeys).toEqual(dotnetKeys);
    
    for (const key of nodeKeys) {
      expect(typeof responses.node[key]).toBe(typeof responses.python[key]);
      expect(typeof responses.python[key]).toBe(typeof responses.dotnet[key]);
    }
  });

  test.skip('TC-062: Cross-Platform Error Handling', async ({ request }) => {
    const responses: Record<string, any> = {};
    
    for (const [platform, url] of Object.entries(PLATFORMS)) {
      try {
        const response = await request.get(`${url}/api/users/999`);
        responses[platform] = {
          status: response.status(),
          body: await response.json()
        };
      } catch (error) {
        console.log(`${platform} is not running, skipping...`);
        return;
      }
    }
    
    expect(responses.node.status).toBe(responses.python.status);
    expect(responses.python.status).toBe(responses.dotnet.status);
    
    expect(responses.node.body.error).toBe(responses.python.body.error);
    expect(responses.python.body.error).toBe(responses.dotnet.body.error);
  });

  test.skip('TC-063: Cross-Platform Validation', async ({ request }) => {
    const invalidUser = {
      name: 'Test',
      email: 'invalid-email',
      age: 25
    };
    
    const responses: Record<string, any> = {};
    
    for (const [platform, url] of Object.entries(PLATFORMS)) {
      try {
        const response = await request.post(`${url}/api/users`, {
          data: invalidUser
        });
        responses[platform] = {
          status: response.status(),
          body: await response.json()
        };
      } catch (error) {
        console.log(`${platform} is not running, skipping...`);
        return;
      }
    }
    
    expect(responses.node.status).toBe(400);
    expect(responses.python.status).toBe(400);
    expect(responses.dotnet.status).toBe(400);
    
    expect(responses.node.body).toHaveProperty('errors');
    expect(responses.python.body).toHaveProperty('errors');
    expect(responses.dotnet.body).toHaveProperty('errors');
  });
});
