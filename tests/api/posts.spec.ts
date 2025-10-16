// spec: API_TEST_PLAN.md
// Test Cases: TC-021 to TC-030

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

test.describe('Post Management', () => {
  
  test.describe('Get All Posts', () => {
    test('TC-021: Get All Posts - Success', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/posts`);
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      
      if (body.length > 0) {
        expect(body[0]).toHaveProperty('author');
        expect(body[0].author).toHaveProperty('id');
        expect(body[0].author).toHaveProperty('name');
        expect(body[0].author).toHaveProperty('email');
      }
    });

    test('TC-022: Get All Posts - Empty Database', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/posts`);
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });

  test.describe('Get Post by ID', () => {
    test('TC-023: Get Post by ID - Success', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/posts/1`);
      
      expect(response.status()).toBe(200);
      
      const body = await response.json();
      expect(body.id).toBe(1);
      expect(body).toHaveProperty('title');
      expect(body).toHaveProperty('content');
      expect(body).toHaveProperty('authorId');
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('author');
      
      expect(body.author).toHaveProperty('id');
      expect(body.author).toHaveProperty('name');
      expect(body.author).toHaveProperty('email');
      expect(body.author).toHaveProperty('age');
    });

    test('TC-024: Get Post by ID - Not Found', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/posts/999`);
      
      expect(response.status()).toBe(404);
    });
  });

  test.describe('Create Post', () => {
    test('TC-025: Create Post - Success', async ({ request }) => {
      const newPost = {
        title: 'New Post',
        content: 'This is a new post',
        authorId: 1
      };

      const response = await request.post(`${BASE_URL}/api/posts`, {
        data: newPost
      });
      
      expect(response.status()).toBe(201);
      
      const body = await response.json();
      expect(body).toHaveProperty('id');
      expect(body.title).toBe(newPost.title);
      expect(body.content).toBe(newPost.content);
      expect(body.authorId).toBe(newPost.authorId);
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('author');
    });

    test('TC-026: Create Post - Missing Required Fields', async ({ request }) => {
      let response = await request.post(`${BASE_URL}/api/posts`, {
        data: { content: 'Content', authorId: 1 }
      });
      expect(response.status()).toBe(400);
      
      response = await request.post(`${BASE_URL}/api/posts`, {
        data: { title: 'Title', authorId: 1 }
      });
      expect(response.status()).toBe(400);
      
      response = await request.post(`${BASE_URL}/api/posts`, {
        data: { title: 'Title', content: 'Content' }
      });
      expect(response.status()).toBe(400);
      
      response = await request.post(`${BASE_URL}/api/posts`, {
        data: {}
      });
      expect(response.status()).toBe(400);
    });

    test('TC-027: Create Post - Empty Title', async ({ request }) => {
      const post = {
        title: '',
        content: 'Some content',
        authorId: 1
      };

      const response = await request.post(`${BASE_URL}/api/posts`, {
        data: post
      });
      
      expect(response.status()).toBe(400);
    });

    test('TC-028: Create Post - Empty Content', async ({ request }) => {
      const post = {
        title: 'Some Title',
        content: '',
        authorId: 1
      };

      const response = await request.post(`${BASE_URL}/api/posts`, {
        data: post
      });
      
      expect(response.status()).toBe(400);
    });

    test('TC-029: Create Post - Non-existent Author', async ({ request }) => {
      const post = {
        title: 'Post Title',
        content: 'Post content',
        authorId: 999
      };

      const response = await request.post(`${BASE_URL}/api/posts`, {
        data: post
      });
      
      expect(response.status()).toBe(400);
      
      const body = await response.json();
      expect(body.error).toBe('Author not found');
    });

    test('TC-030: Create Post - Invalid Author ID', async ({ request }) => {
      let response = await request.post(`${BASE_URL}/api/posts`, {
        data: { title: 'Title', content: 'Content', authorId: 'abc' }
      });
      expect(response.status()).toBe(400);
      
      response = await request.post(`${BASE_URL}/api/posts`, {
        data: { title: 'Title', content: 'Content', authorId: -1 }
      });
      expect(response.status()).toBe(400);
      
      response = await request.post(`${BASE_URL}/api/posts`, {
        data: { title: 'Title', content: 'Content', authorId: 0 }
      });
      expect(response.status()).toBe(400);
      
      response = await request.post(`${BASE_URL}/api/posts`, {
        data: { title: 'Title', content: 'Content', authorId: null }
      });
      expect(response.status()).toBe(400);
    });
  });
});
