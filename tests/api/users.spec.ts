// spec: API_TEST_PLAN.md
// Test Cases: TC-002 to TC-020

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('User Management', () => {
  
  test.describe('Get All Users', () => {
    test('TC-002: Get All Users - Default Pagination', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/users`);
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body).toHaveProperty('users');
      expect(body).toHaveProperty('pagination');
      expect(Array.isArray(body.users)).toBe(true);
      
      // Verify pagination defaults
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(10);
      expect(body.pagination).toHaveProperty('total');
      expect(body.pagination).toHaveProperty('pages');
    });

    test('TC-003: Get All Users - Custom Pagination', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/users?page=2&limit=2`);
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.pagination.page).toBe(2);
      expect(body.pagination.limit).toBe(2);
      expect(body.users.length).toBeLessThanOrEqual(2);
    });

    test('TC-004: Get All Users - Edge Cases', async ({ request }) => {
      // Test page = 0
      let response = await request.get(`${BASE_URL}/api/users?page=0`);
      expect(response.status()).toBe(200);
      
      // Test page > total pages
      response = await request.get(`${BASE_URL}/api/users?page=9999`);
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.users.length).toBe(0);
      
      // Test limit = 0
      response = await request.get(`${BASE_URL}/api/users?limit=0`);
      expect(response.status()).toBe(200);
    });
  });

  test.describe('Get User by ID', () => {
    test('TC-005: Get User by ID - Success', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/users/1`);
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.id).toBe(1);
      expect(body).toHaveProperty('name');
      expect(body).toHaveProperty('email');
      expect(body).toHaveProperty('age');
    });

    test('TC-006: Get User by ID - Not Found', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/users/999`);
      
      expect(response.status()).toBe(404);
      
      const body = await response.json();
      expect(body.error).toBe('User not found');
    });

    test('TC-007: Get User by ID - Invalid ID Format', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/users/abc`);
      
      expect([400, 404]).toContain(response.status());
    });
  });

  test.describe('Create User', () => {
    test('TC-008: Create User - Success', async ({ request }) => {
      const newUser = {
        name: 'New User',
        email: `newuser${Date.now()}@example.com`,
        age: 28
      };

      const response = await request.post(`${BASE_URL}/api/users`, {
        data: newUser
      });
      
      expect(response.status()).toBe(201);
      
      const body = await response.json();
      expect(body).toHaveProperty('id');
      expect(body.name).toBe(newUser.name);
      expect(body.email).toBe(newUser.email);
      expect(body.age).toBe(newUser.age);
      
      // Verify user can be retrieved
      const getResponse = await request.get(`${BASE_URL}/api/users/${body.id}`);
      expect(getResponse.status()).toBe(200);
    });

    test('TC-009: Create User - Missing Required Fields', async ({ request }) => {
      const invalidUser = {
        name: 'Test User'
      };

      const response = await request.post(`${BASE_URL}/api/users`, {
        data: invalidUser
      });
      
      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body).toHaveProperty('errors');
    });

    test('TC-010: Create User - Invalid Email Format', async ({ request }) => {
      const invalidUser = {
        name: 'Test User',
        email: 'invalid-email',
        age: 25
      };

      const response = await request.post(`${BASE_URL}/api/users`, {
        data: invalidUser
      });
      
      expect(response.status()).toBe(400);
    });

    test('TC-011: Create User - Invalid Age', async ({ request }) => {
      // Age = 0
      let response = await request.post(`${BASE_URL}/api/users`, {
        data: { name: 'Test', email: 'test@example.com', age: 0 }
      });
      expect(response.status()).toBe(400);
      
      // Age = -5
      response = await request.post(`${BASE_URL}/api/users`, {
        data: { name: 'Test', email: 'test2@example.com', age: -5 }
      });
      expect(response.status()).toBe(400);
      
      // Age = 121
      response = await request.post(`${BASE_URL}/api/users`, {
        data: { name: 'Test', email: 'test3@example.com', age: 121 }
      });
      expect(response.status()).toBe(400);
      
      // Age = "abc"
      response = await request.post(`${BASE_URL}/api/users`, {
        data: { name: 'Test', email: 'test4@example.com', age: 'abc' }
      });
      expect(response.status()).toBe(400);
      
      // Age = 1 (should pass)
      response = await request.post(`${BASE_URL}/api/users`, {
        data: { name: 'Test', email: `test${Date.now()}@example.com`, age: 1 }
      });
      expect(response.status()).toBe(201);
      
      // Age = 120 (should pass)
      response = await request.post(`${BASE_URL}/api/users`, {
        data: { name: 'Test', email: `test${Date.now()}@example.com`, age: 120 }
      });
      expect(response.status()).toBe(201);
    });

    test('TC-012: Create User - Duplicate Email', async ({ request }) => {
      const user = {
        name: 'Another User',
        email: 'john@example.com',
        age: 25
      };

      const response = await request.post(`${BASE_URL}/api/users`, {
        data: user
      });
      
      expect(response.status()).toBe(409);
      
      const body = await response.json();
      expect(body.error).toBe('Email already exists');
    });

    test('TC-013: Create User - Empty Name', async ({ request }) => {
      const user = {
        name: '',
        email: 'test@example.com',
        age: 25
      };

      const response = await request.post(`${BASE_URL}/api/users`, {
        data: user
      });
      
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Update User', () => {
    test('TC-014: Update User - Success', async ({ request }) => {
      const updateData = {
        name: 'Updated Name',
        email: `updated${Date.now()}@example.com`,
        age: 31
      };

      const response = await request.put(`${BASE_URL}/api/users/1`, {
        data: updateData
      });
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.name).toBe(updateData.name);
      expect(body.email).toBe(updateData.email);
      expect(body.age).toBe(updateData.age);
      
      // Verify changes with GET
      const getResponse = await request.get(`${BASE_URL}/api/users/1`);
      const getBody = await getResponse.json();
      expect(getBody.name).toBe(updateData.name);
    });

    test('TC-015: Update User - Not Found', async ({ request }) => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        age: 31
      };

      const response = await request.put(`${BASE_URL}/api/users/999`, {
        data: updateData
      });
      
      expect(response.status()).toBe(404);
    });

    test('TC-016: Update User - Duplicate Email', async ({ request }) => {
      const updateData = {
        name: 'John Doe',
        email: 'jane@example.com',
        age: 30
      };

      const response = await request.put(`${BASE_URL}/api/users/1`, {
        data: updateData
      });
      
      expect(response.status()).toBe(409);
      
      const body = await response.json();
      expect(body.error).toBe('Email already exists');
    });

    test('TC-017: Update User - Invalid Data', async ({ request }) => {
      // Invalid email
      let response = await request.put(`${BASE_URL}/api/users/1`, {
        data: { name: 'Test', email: 'invalid-email', age: 25 }
      });
      expect(response.status()).toBe(400);
      
      // Invalid age (negative)
      response = await request.put(`${BASE_URL}/api/users/1`, {
        data: { name: 'Test', email: 'test@example.com', age: -5 }
      });
      expect(response.status()).toBe(400);
      
      // Missing required fields
      response = await request.put(`${BASE_URL}/api/users/1`, {
        data: { name: 'Test' }
      });
      expect(response.status()).toBe(400);
      
      // Empty name
      response = await request.put(`${BASE_URL}/api/users/1`, {
        data: { name: '', email: 'test@example.com', age: 25 }
      });
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Delete User', () => {
    test('TC-018: Delete User - Success', async ({ request }) => {
      // First create a user to delete
      const newUser = {
        name: 'To Delete',
        email: `delete${Date.now()}@example.com`,
        age: 30
      };
      
      const createResponse = await request.post(`${BASE_URL}/api/users`, {
        data: newUser
      });
      const createdUser = await createResponse.json();
      
      // Delete the user
      const deleteResponse = await request.delete(`${BASE_URL}/api/users/${createdUser.id}`);
      expect(deleteResponse.status()).toBe(204);
      
      // Verify user is deleted
      const getResponse = await request.get(`${BASE_URL}/api/users/${createdUser.id}`);
      expect(getResponse.status()).toBe(404);
    });

    test('TC-019: Delete User - Not Found', async ({ request }) => {
      const response = await request.delete(`${BASE_URL}/api/users/999`);
      
      expect(response.status()).toBe(404);
    });

    test('TC-020: Delete User - Verify Post Integrity', async ({ request }) => {
      // Get a user with posts
      const postsResponse = await request.get(`${BASE_URL}/api/posts`);
      const posts = await postsResponse.json();
      
      if (posts.length > 0) {
        const authorId = posts[0].authorId;
        
        // Delete the user
        await request.delete(`${BASE_URL}/api/users/${authorId}`);
        
        // Check post still exists and references deleted user
        const postResponse = await request.get(`${BASE_URL}/api/posts/${posts[0].id}`);
        expect(postResponse.status()).toBe(200);
      }
    });
  });
});
