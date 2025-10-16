// spec: API_TEST_PLAN.md
// Test Cases: TC-031 to TC-036

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Search Functionality', () => {
  
  test('TC-031: Search Users - By Name', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/search/users?q=John`);
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    
    body.forEach((user: any) => {
      expect(user.name.toLowerCase()).toContain('john');
    });
  });

  test('TC-032: Search Users - By Email', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/search/users?q=example.com`);
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    
    body.forEach((user: any) => {
      expect(user.email.toLowerCase()).toContain('example.com');
    });
  });

  test('TC-033: Search Users - No Results', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/search/users?q=nonexistent`);
    
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });

  test('TC-034: Search Users - Missing Query Parameter', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/search/users`);
    
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body.error).toBe('Search query is required');
  });

  test('TC-035: Search Users - Empty Query', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/search/users?q=`);
    
    expect(response.status()).toBe(400);
  });

  test('TC-036: Search Users - Special Characters', async ({ request }) => {
    let response = await request.get(`${BASE_URL}/api/search/users?q=${encodeURIComponent('@')}`);
    expect(response.status()).toBe(200);
    let body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    
    response = await request.get(`${BASE_URL}/api/search/users?q=${encodeURIComponent('john doe')}`);
    expect(response.status()).toBe(200);
    body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
