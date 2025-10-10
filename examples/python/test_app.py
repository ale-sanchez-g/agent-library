import pytest
from fastapi.testclient import TestClient
from app import app
import json

client = TestClient(app)

class TestApp:
    """Test suite for the FastAPI application"""
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "OK"
        assert "timestamp" in data
    
    def test_get_users_with_pagination(self):
        """Test getting users with pagination"""
        response = client.get("/api/users")
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "pagination" in data
        assert isinstance(data["users"], list)
        
    def test_get_users_pagination_parameters(self):
        """Test pagination parameters"""
        response = client.get("/api/users?page=1&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert data["pagination"]["page"] == 1
        assert data["pagination"]["limit"] == 2
    
    def test_get_user_by_id(self):
        """Test getting user by ID"""
        response = client.get("/api/users/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert "name" in data
        assert "email" in data
    
    def test_get_user_not_found(self):
        """Test getting non-existent user"""
        response = client.get("/api/users/999")
        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "User not found"
    
    def test_create_user(self):
        """Test creating a new user"""
        new_user = {
            "name": "Test User",
            "email": "test@example.com",
            "age": 25
        }
        response = client.post("/api/users", json=new_user)
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["name"] == new_user["name"]
        assert data["email"] == new_user["email"]
        assert data["age"] == new_user["age"]
    
    def test_create_user_validation_errors(self):
        """Test user creation validation"""
        invalid_user = {
            "name": "",
            "email": "invalid-email",
            "age": -1
        }
        response = client.post("/api/users", json=invalid_user)
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
    
    def test_create_user_duplicate_email(self):
        """Test creating user with duplicate email"""
        user_data = {
            "name": "Test User",
            "email": "john@example.com",  # This email already exists
            "age": 25
        }
        response = client.post("/api/users", json=user_data)
        assert response.status_code == 409
        data = response.json()
        assert data["error"] == "Email already exists"
    
    def test_update_user(self):
        """Test updating a user"""
        update_data = {
            "name": "Updated Name",
            "email": "updated@example.com",
            "age": 35
        }
        response = client.put("/api/users/1", json=update_data)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["email"] == update_data["email"]
        assert data["age"] == update_data["age"]
    
    def test_update_user_not_found(self):
        """Test updating non-existent user"""
        update_data = {
            "name": "Updated Name",
            "email": "updated@example.com",
            "age": 35
        }
        response = client.put("/api/users/999", json=update_data)
        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "User not found"
    
    def test_delete_user(self):
        """Test deleting a user"""
        # First create a user to delete
        new_user = {
            "name": "To Delete",
            "email": "delete@example.com",
            "age": 30
        }
        create_response = client.post("/api/users", json=new_user)
        user_id = create_response.json()["id"]
        
        # Now delete the user
        response = client.delete(f"/api/users/{user_id}")
        assert response.status_code == 204
        
        # Verify user is deleted
        get_response = client.get(f"/api/users/{user_id}")
        assert get_response.status_code == 404
    
    def test_delete_user_not_found(self):
        """Test deleting non-existent user"""
        response = client.delete("/api/users/999")
        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "User not found"
    
    def test_get_posts(self):
        """Test getting all posts"""
        response = client.get("/api/posts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert "author" in data[0]
    
    def test_get_post_by_id(self):
        """Test getting post by ID"""
        response = client.get("/api/posts/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert "title" in data
        assert "content" in data
        assert "author" in data
    
    def test_get_post_not_found(self):
        """Test getting non-existent post"""
        response = client.get("/api/posts/999")
        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "Post not found"
    
    def test_create_post(self):
        """Test creating a new post"""
        new_post = {
            "title": "Test Post",
            "content": "This is a test post content",
            "authorId": 1
        }
        response = client.post("/api/posts", json=new_post)
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["title"] == new_post["title"]
        assert data["content"] == new_post["content"]
        assert data["authorId"] == new_post["authorId"]
        assert "author" in data
    
    def test_create_post_invalid_author(self):
        """Test creating post with invalid author"""
        new_post = {
            "title": "Test Post",
            "content": "This is a test post content",
            "authorId": 999  # Non-existent author
        }
        response = client.post("/api/posts", json=new_post)
        assert response.status_code == 400
        data = response.json()
        assert data["error"] == "Author not found"
    
    def test_create_post_validation_errors(self):
        """Test post creation validation"""
        invalid_post = {
            "title": "",
            "content": "",
            "authorId": "not-a-number"
        }
        response = client.post("/api/posts", json=invalid_post)
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
    
    def test_search_users(self):
        """Test searching users"""
        response = client.get("/api/search/users?q=john")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should find John Doe
        found_john = any(user["name"].lower().find("john") != -1 for user in data)
        assert found_john
    
    def test_search_users_no_query(self):
        """Test searching users without query parameter"""
        response = client.get("/api/search/users")
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data  # Pydantic validation errors still use 'detail'
    
    def test_search_users_by_email(self):
        """Test searching users by email"""
        response = client.get("/api/search/users?q=jane@example.com")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should find Jane Smith
        found_jane = any(user["email"] == "jane@example.com" for user in data)
        assert found_jane
    
    def test_get_stats(self):
        """Test getting statistics"""
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "totalUsers" in data
        assert "totalPosts" in data
        assert "averageAge" in data
        assert "postsPerUser" in data
        assert isinstance(data["totalUsers"], int)
        assert isinstance(data["totalPosts"], int)
        assert isinstance(data["averageAge"], (int, float))
        assert isinstance(data["postsPerUser"], (int, float))
    
    def test_404_handler(self):
        """Test 404 handler for unknown routes"""
        response = client.get("/unknown-route")
        assert response.status_code == 404
        data = response.json()
        assert data["error"] == "Route not found"

class TestRateLimit:
    """Test rate limiting functionality"""
    
    @pytest.mark.slow
    def test_rate_limit(self):
        """Test rate limiting (simplified test)"""
        # This is a simplified test since we can't easily test 100 requests
        # In a real scenario, you'd want to mock the rate limiting mechanism
        responses = []
        for i in range(5):
            response = client.get("/api/users")
            responses.append(response.status_code)
        
        # All requests should succeed for this small number
        assert all(status == 200 for status in responses)

class TestValidation:
    """Test input validation"""
    
    def test_user_age_validation(self):
        """Test user age validation boundaries"""
        # Test minimum age
        user_data = {"name": "Test", "email": "test1@test.com", "age": 0}
        response = client.post("/api/users", json=user_data)
        assert response.status_code == 422
        
        # Test maximum age
        user_data = {"name": "Test", "email": "test2@test.com", "age": 121}
        response = client.post("/api/users", json=user_data)
        assert response.status_code == 422
        
        # Test valid age
        user_data = {"name": "Test", "email": "test3@test.com", "age": 25}
        response = client.post("/api/users", json=user_data)
        assert response.status_code == 201
    
    def test_email_validation(self):
        """Test email format validation"""
        invalid_emails = [
            "not-an-email",
            "missing@domain",
            "@missing-user.com",
            "spaces in@email.com"
        ]
        
        for email in invalid_emails:
            user_data = {"name": "Test", "email": email, "age": 25}
            response = client.post("/api/users", json=user_data)
            assert response.status_code == 422
    
    def test_required_fields(self):
        """Test required field validation"""
        # Missing name
        response = client.post("/api/users", json={"email": "test@test.com", "age": 25})
        assert response.status_code == 422
        
        # Missing email
        response = client.post("/api/users", json={"name": "Test", "age": 25})
        assert response.status_code == 422
        
        # Missing age
        response = client.post("/api/users", json={"name": "Test", "email": "test@test.com"})
        assert response.status_code == 422

# Integration tests
class TestIntegration:
    """Integration tests for complex workflows"""
    
    def test_user_post_workflow(self):
        """Test complete user and post workflow"""
        # Create a user
        user_data = {
            "name": "Integration Test User",
            "email": "integration@test.com",
            "age": 28
        }
        user_response = client.post("/api/users", json=user_data)
        assert user_response.status_code == 201
        user_id = user_response.json()["id"]
        
        # Create a post by this user
        post_data = {
            "title": "Integration Test Post",
            "content": "This is an integration test post",
            "authorId": user_id
        }
        post_response = client.post("/api/posts", json=post_data)
        assert post_response.status_code == 201
        post_id = post_response.json()["id"]
        
        # Verify post has correct author information
        get_post_response = client.get(f"/api/posts/{post_id}")
        assert get_post_response.status_code == 200
        post_data = get_post_response.json()
        assert post_data["author"]["id"] == user_id
        assert post_data["author"]["email"] == user_data["email"]
        
        # Search for the user
        search_response = client.get(f"/api/search/users?q={user_data['name']}")
        assert search_response.status_code == 200
        search_results = search_response.json()
        found_user = any(user["id"] == user_id for user in search_results)
        assert found_user
        
        # Check updated stats
        stats_response = client.get("/api/stats")
        assert stats_response.status_code == 200
        stats = stats_response.json()
        assert stats["totalUsers"] >= 1
        assert stats["totalPosts"] >= 1