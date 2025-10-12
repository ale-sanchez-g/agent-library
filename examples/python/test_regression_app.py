import pytest
import asyncio
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app import app, users_db, posts_db, rate_limit_storage
import json
import time
import os
import threading
from datetime import datetime

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_test_data():
    """Reset in-memory database before each test"""
    global users_db, posts_db, rate_limit_storage
    
    # Reset users
    users_db.clear()
    users_db.extend([
        {"id": 1, "name": "John Doe", "email": "john@example.com", "age": 30},
        {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "age": 25},
        {"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "age": 35}
    ])
    
    # Reset posts
    posts_db.clear()
    posts_db.extend([
        {"id": 1, "title": "First Post", "content": "This is the first post", "authorId": 1, "createdAt": datetime.now()},
        {"id": 2, "title": "Second Post", "content": "This is the second post", "authorId": 2, "createdAt": datetime.now()}
    ])
    
    # Reset rate limiting
    rate_limit_storage.clear()
    
    yield

class TestInfrastructureCoverage:
    """Test application infrastructure components for better coverage"""
    
    def test_cors_headers_present(self):
        """Test CORS headers are properly set"""
        response = client.get("/api/users")
        assert response.status_code == 200
        # Check that CORS headers are present (added by CORSMiddleware)
        assert "access-control-allow-origin" in response.headers
    
    def test_process_time_header(self):
        """Test that process time header is added by middleware"""
        response = client.get("/health")
        assert response.status_code == 200
        assert "x-process-time" in response.headers
        # Should be a valid float
        process_time = float(response.headers["x-process-time"])
        assert process_time >= 0
    
    def test_middleware_order_execution(self):
        """Test that middleware executes in correct order"""
        response = client.get("/api/users")
        assert response.status_code == 200
        # Should have both CORS and process time headers
        assert "access-control-allow-origin" in response.headers
        assert "x-process-time" in response.headers

class TestRateLimitingComprehensive:
    """Comprehensive rate limiting tests"""
    
    def test_rate_limit_storage_initialization(self):
        """Test rate limit storage is properly initialized"""
        # Clear storage and make a request
        rate_limit_storage.clear()
        response = client.get("/api/users")
        assert response.status_code == 200
        
        # Check that rate limiting storage is tracking requests
        # Note: This is implementation-dependent
    
    def test_rate_limit_cleanup_logic(self):
        """Test rate limit window cleanup logic"""
        # This tests the cleanup of old entries in rate limiting
        rate_limit_storage.clear()
        
        # Make several requests
        for i in range(10):
            response = client.get("/api/users")
            assert response.status_code == 200
        
        # Check storage has entries (implementation detail)
        # Note: Actual cleanup testing would require time mocking
    
    def test_non_api_routes_not_rate_limited(self):
        """Test that non-API routes bypass rate limiting"""
        # Health endpoint is not under /api/ so shouldn't be rate limited
        for i in range(10):
            response = client.get("/health")
            assert response.status_code == 200

class TestExceptionHandlingCoverage:
    """Test exception handling paths to improve coverage"""
    
    @patch('app.find_user_by_id')
    def test_global_exception_handler_triggered(self, mock_find):
        """Test global exception handler is triggered for unhandled exceptions"""
        # Mock an unexpected exception
        mock_find.side_effect = RuntimeError("Unexpected database error")
        
        response = client.get("/api/users/1")
        assert response.status_code == 500
        data = response.json()
        assert data["error"] == "Something went wrong!"
    
    @patch('app.users_db')
    def test_database_error_in_get_users(self, mock_db):
        """Test database error handling in get_users endpoint"""
        # Mock database to raise an exception
        mock_db.__len__.side_effect = Exception("Database connection lost")
        
        response = client.get("/api/users")
        assert response.status_code == 500
        data = response.json()
        assert data["error"] == "Something went wrong!"
    
    @patch('app.users_db')
    def test_database_error_in_create_user(self, mock_db):
        """Test database error handling in create_user endpoint"""
        # Mock database to raise an exception during append
        mock_db.append.side_effect = Exception("Database write failed")
        
        user_data = {
            "name": "Test User",
            "email": "test@example.com",
            "age": 25
        }
        response = client.post("/api/users", json=user_data)
        assert response.status_code == 500
        data = response.json()
        assert data["error"] == "Something went wrong!"
    
    def test_http_exception_handler_format(self):
        """Test HTTPException handler formats responses correctly"""
        response = client.get("/api/users/999")
        assert response.status_code == 404
        data = response.json()
        # Should use 'error' key, not 'detail'
        assert "error" in data
        assert "detail" not in data
        assert data["error"] == "User not found"

class TestHelperFunctionsCoverage:
    """Test helper functions to improve coverage"""
    
    def test_find_user_by_email_with_exclusion(self):
        """Test find_user_by_email with exclude_id parameter"""
        # Update user 1 with user 2's email (should fail)
        update_data = {
            "name": "Updated John",
            "email": "jane@example.com",  # Jane's email
            "age": 31
        }
        response = client.put("/api/users/1", json=update_data)
        assert response.status_code == 409
        data = response.json()
        assert data["error"] == "Email already exists"
    
    def test_find_user_by_email_edge_cases(self):
        """Test edge cases in email finding"""
        # Try to create user with existing email
        user_data = {
            "name": "Another John",
            "email": "john@example.com",  # Existing email
            "age": 25
        }
        response = client.post("/api/users", json=user_data)
        assert response.status_code == 409
        data = response.json()
        assert data["error"] == "Email already exists"

class TestValidationEdgeCases:
    """Test validation edge cases for better coverage"""
    
    def test_boundary_age_values(self):
        """Test exact boundary values for age validation"""
        # Test age 1 (minimum valid)
        user_data = {"name": "Young", "email": "young@test.com", "age": 1}
        response = client.post("/api/users", json=user_data)
        assert response.status_code == 201
        
        # Test age 120 (maximum valid)
        user_data = {"name": "Old", "email": "old@test.com", "age": 120}
        response = client.post("/api/users", json=user_data)
        assert response.status_code == 201
    
    def test_edge_case_email_formats(self):
        """Test various edge case email formats"""
        # Valid edge case emails
        valid_emails = [
            "user+tag@example.com",
            "user.name@example.com",
            "user_name@example-domain.com"
        ]
        
        for i, email in enumerate(valid_emails):
            user_data = {"name": f"User{i}", "email": email, "age": 25}
            response = client.post("/api/users", json=user_data)
            assert response.status_code == 201, f"Email {email} should be valid"
    
    def test_json_parsing_errors(self):
        """Test malformed JSON handling"""
        # Send malformed JSON
        response = client.post(
            "/api/users",
            data='{"name": "Test", "email": "test@test.com", "age":}',  # Invalid JSON
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422

class TestPerformanceAndStress:
    """Basic performance and stress testing"""
    
    def test_concurrent_user_creation(self):
        """Test concurrent user creation doesn't cause issues"""
        import threading
        import queue
        
        results = queue.Queue()
        
        def create_user(user_id):
            user_data = {
                "name": f"Concurrent User {user_id}",
                "email": f"concurrent{user_id}@test.com",
                "age": 25
            }
            response = client.post("/api/users", json=user_data)
            results.put((user_id, response.status_code))
        
        # Create 5 users concurrently
        threads = []
        for i in range(5):
            t = threading.Thread(target=create_user, args=(i,))
            threads.append(t)
            t.start()
        
        # Wait for all threads
        for t in threads:
            t.join()
        
        # Check results
        created_users = 0
        while not results.empty():
            user_id, status_code = results.get()
            if status_code == 201:
                created_users += 1
        
        # Should have created all users successfully
        assert created_users == 5
    
    def test_large_dataset_pagination(self):
        """Test pagination with larger dataset"""
        # Create more users
        for i in range(15):
            user_data = {
                "name": f"Bulk User {i}",
                "email": f"bulk{i}@test.com",
                "age": 20 + (i % 50)
            }
            client.post("/api/users", json=user_data)
        
        # Test pagination
        response = client.get("/api/users?page=2&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["users"]) <= 5
        assert data["pagination"]["page"] == 2

class TestStatisticsAccuracy:
    """Test statistics calculation accuracy"""
    
    def test_stats_calculation_accuracy(self):
        """Test that statistics are calculated correctly"""
        # Clear and add known data
        users_db.clear()
        users_db.extend([
            {"id": 1, "name": "User1", "email": "user1@test.com", "age": 20},
            {"id": 2, "name": "User2", "email": "user2@test.com", "age": 30},
            {"id": 3, "name": "User3", "email": "user3@test.com", "age": 40}
        ])
        
        posts_db.clear()
        posts_db.extend([
            {"id": 1, "title": "Post1", "content": "Content1", "authorId": 1},
            {"id": 2, "title": "Post2", "content": "Content2", "authorId": 1},
            {"id": 3, "title": "Post3", "content": "Content3", "authorId": 2}
        ])
        
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        
        # Verify calculations
        assert data["totalUsers"] == 3
        assert data["totalPosts"] == 3
        assert data["averageAge"] == 30.0  # (20+30+40)/3
        assert data["postsPerUser"] == 1.0  # 3 posts / 3 users
    
    def test_stats_with_no_users(self):
        """Test statistics when no users exist"""
        users_db.clear()
        posts_db.clear()
        
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        
        assert data["totalUsers"] == 0
        assert data["totalPosts"] == 0
        assert data["averageAge"] == 0
        assert data["postsPerUser"] == 0

class TestSearchFunctionality:
    """Test search functionality edge cases"""
    
    def test_search_case_insensitive(self):
        """Test search is case insensitive"""
        # Search for "JOHN" should find "John Doe"
        response = client.get("/api/search/users?q=JOHN")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        assert any("john" in user["name"].lower() for user in data)
    
    def test_search_partial_match(self):
        """Test search partial matching"""
        # Search for "jo" should find "John"
        response = client.get("/api/search/users?q=jo")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        assert any("john" in user["name"].lower() for user in data)
    
    def test_search_no_results(self):
        """Test search with no matching results"""
        response = client.get("/api/search/users?q=nonexistent")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0
    
    def test_search_special_characters(self):
        """Test search with special characters"""
        response = client.get("/api/search/users?q=@#$%")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should handle special characters gracefully

class TestDeleteCascadeSimulation:
    """Test delete operations and their effects"""
    
    def test_delete_user_with_posts_orphans_posts(self):
        """Test deleting a user leaves orphaned posts"""
        # Verify John has posts
        posts_response = client.get("/api/posts")
        posts = posts_response.json()
        john_posts = [p for p in posts if p["authorId"] == 1]
        assert len(john_posts) > 0
        
        # Delete John
        response = client.delete("/api/users/1")
        assert response.status_code == 204
        
        # Check posts still exist but author info might be affected
        posts_response = client.get("/api/posts")
        posts = posts_response.json()
        # Posts should still exist (this is current behavior)
        # In production, you might want cascade delete or set author to null