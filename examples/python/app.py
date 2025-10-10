from fastapi import FastAPI, HTTPException, Query, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uvicorn
import os
from contextlib import asynccontextmanager
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models for request/response validation
class User(BaseModel):
    id: Optional[int] = None
    name: str = Field(..., min_length=1, description="Name is required")
    email: EmailStr = Field(..., description="Valid email is required")
    age: int = Field(..., ge=1, le=120, description="Age must be between 1 and 120")

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    age: int = Field(..., ge=1, le=120)

class UserUpdate(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    age: int = Field(..., ge=1, le=120)

class Post(BaseModel):
    id: Optional[int] = None
    title: str = Field(..., min_length=1, description="Title is required")
    content: str = Field(..., min_length=1, description="Content is required")
    authorId: int = Field(..., description="Author ID must be a number")
    createdAt: Optional[datetime] = None
    author: Optional[User] = None

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1)
    content: str = Field(..., min_length=1)
    authorId: int

class PaginationResponse(BaseModel):
    users: List[User]
    pagination: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    timestamp: str

class StatsResponse(BaseModel):
    totalUsers: int
    totalPosts: int
    averageAge: float
    postsPerUser: float

# In-memory database simulation
users_db = [
    {"id": 1, "name": "John Doe", "email": "john@example.com", "age": 30},
    {"id": 2, "name": "Jane Smith", "email": "jane@example.com", "age": 25},
    {"id": 3, "name": "Bob Johnson", "email": "bob@example.com", "age": 35}
]

posts_db = [
    {"id": 1, "title": "First Post", "content": "This is the first post", "authorId": 1, "createdAt": datetime.now()},
    {"id": 2, "title": "Second Post", "content": "This is the second post", "authorId": 2, "createdAt": datetime.now()}
]

# Rate limiting storage (simple in-memory implementation)
rate_limit_storage = {}

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up the application...")
    yield
    # Shutdown
    logger.info("Shutting down the application...")

# Create FastAPI app
app = FastAPI(
    title="Agent Library Demo API",
    description="FastAPI application for demonstrating GitHub Copilot expert agents",
    version="1.0.0",
    lifespan=lifespan
)

# Security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"{datetime.now().isoformat()} - {request.method} {request.url.path}")
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Rate limiting middleware (simplified)
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        client_ip = request.client.host
        current_time = time.time()
        window_start = current_time - 900  # 15 minutes
        
        # Clean old entries
        if client_ip in rate_limit_storage:
            rate_limit_storage[client_ip] = [
                timestamp for timestamp in rate_limit_storage[client_ip] 
                if timestamp > window_start
            ]
        else:
            rate_limit_storage[client_ip] = []
        
        # Check rate limit
        if len(rate_limit_storage[client_ip]) >= 100:
            return JSONResponse(
                status_code=429,
                content={"error": "Too many requests"}
            )
        
        # Add current request
        rate_limit_storage[client_ip].append(current_time)
    
    response = await call_next(request)
    return response

# Helper functions
def find_user_by_id(user_id: int) -> Optional[dict]:
    return next((user for user in users_db if user["id"] == user_id), None)

def find_post_by_id(post_id: int) -> Optional[dict]:
    return next((post for post in posts_db if post["id"] == post_id), None)

def find_user_by_email(email: str, exclude_id: Optional[int] = None) -> Optional[dict]:
    return next(
        (user for user in users_db if user["email"] == email and user["id"] != exclude_id),
        None
    )

# Routes

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="OK",
        timestamp=datetime.now().isoformat()
    )

@app.get("/api/users", response_model=PaginationResponse)
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    """Get all users with pagination"""
    try:
        start_index = (page - 1) * limit
        end_index = start_index + limit
        
        paginated_users = users_db[start_index:end_index]
        
        return PaginationResponse(
            users=[User(**user) for user in paginated_users],
            pagination={
                "page": page,
                "limit": limit,
                "total": len(users_db),
                "pages": (len(users_db) + limit - 1) // limit
            }
        )
    except Exception as e:
        logger.error(f"Error getting users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    """Get user by ID"""
    try:
        user = find_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return User(**user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/users", response_model=User, status_code=201)
async def create_user(user: UserCreate):
    """Create new user"""
    try:
        # Check if email already exists
        existing_user = find_user_by_email(user.email)
        if existing_user:
            raise HTTPException(status_code=409, detail="Email already exists")
        
        new_user = {
            "id": len(users_db) + 1,
            "name": user.name,
            "email": user.email,
            "age": user.age
        }
        
        users_db.append(new_user)
        return User(**new_user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.put("/api/users/{user_id}", response_model=User)
async def update_user(user_id: int, user_update: UserUpdate):
    """Update user"""
    try:
        user = find_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if email already exists for other users
        existing_user = find_user_by_email(user_update.email, exclude_id=user_id)
        if existing_user:
            raise HTTPException(status_code=409, detail="Email already exists")
        
        user["name"] = user_update.name
        user["email"] = user_update.email
        user["age"] = user_update.age
        
        return User(**user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/api/users/{user_id}", status_code=204)
async def delete_user(user_id: int):
    """Delete user"""
    try:
        user_index = next(
            (i for i, user in enumerate(users_db) if user["id"] == user_id), 
            None
        )
        if user_index is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        users_db.pop(user_index)
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/posts", response_model=List[Post])
async def get_posts():
    """Get all posts with author information"""
    try:
        posts_with_authors = []
        for post in posts_db:
            author = find_user_by_id(post["authorId"])
            post_with_author = {
                **post,
                "author": User(**author) if author else None
            }
            posts_with_authors.append(Post(**post_with_author))
        
        return posts_with_authors
    except Exception as e:
        logger.error(f"Error getting posts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/posts/{post_id}", response_model=Post)
async def get_post(post_id: int):
    """Get post by ID"""
    try:
        post = find_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        author = find_user_by_id(post["authorId"])
        post_with_author = {
            **post,
            "author": User(**author) if author else None
        }
        
        return Post(**post_with_author)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting post {post_id}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/posts", response_model=Post, status_code=201)
async def create_post(post: PostCreate):
    """Create new post"""
    try:
        # Check if author exists
        author = find_user_by_id(post.authorId)
        if not author:
            raise HTTPException(status_code=400, detail="Author not found")
        
        new_post = {
            "id": len(posts_db) + 1,
            "title": post.title,
            "content": post.content,
            "authorId": post.authorId,
            "createdAt": datetime.now()
        }
        
        posts_db.append(new_post)
        
        post_with_author = {
            **new_post,
            "author": User(**author)
        }
        
        return Post(**post_with_author)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating post: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/search/users", response_model=List[User])
async def search_users(q: str = Query(..., description="Search query is required")):
    """Search users by name or email"""
    try:
        search_results = [
            user for user in users_db
            if q.lower() in user["name"].lower() or q.lower() in user["email"].lower()
        ]
        
        return [User(**user) for user in search_results]
    except Exception as e:
        logger.error(f"Error searching users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get user and post statistics"""
    try:
        total_users = len(users_db)
        total_posts = len(posts_db)
        average_age = sum(user["age"] for user in users_db) / total_users if total_users > 0 else 0
        posts_per_user = total_posts / total_users if total_users > 0 else 0
        
        return StatsResponse(
            totalUsers=total_users,
            totalPosts=total_posts,
            averageAge=average_age,
            postsPerUser=posts_per_user
        )
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Catch-all route for unmatched paths (must be last)
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def catch_all(path: str):
    """Handle all unmatched routes"""
    raise HTTPException(status_code=404, detail="Route not found")

# Custom exception handler for HTTPException to match Node.js format
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong!"}
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )