const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory database simulation
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
];

let posts = [
  { id: 1, title: 'First Post', content: 'This is the first post', authorId: 1, createdAt: new Date() },
  { id: 2, title: 'Second Post', content: 'This is the second post', authorId: 2, createdAt: new Date() }
];

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Helper function to find user by ID
function findUserById(id) {
  return users.find(user => user.id === parseInt(id));
}

// Helper function to find post by ID
function findPostById(id) {
  return posts.find(post => post.id === parseInt(id));
}

// Validation middleware
const validateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120')
];

const validatePost = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('authorId').isInt().withMessage('Author ID must be a number')
];

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedUsers = users.slice(startIndex, endIndex);
    
    res.json({
      users: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length,
        pages: Math.ceil(users.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  try {
    const user = findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user
app.post('/api/users', validateUser, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, age } = req.body;
    
    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const newUser = {
      id: users.length + 1,
      name,
      email,
      age: parseInt(age)
    };

    users.push(newUser);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
app.put('/api/users/:id', validateUser, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = findUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, email, age } = req.body;
    
    // Check if email already exists for other users
    const existingUser = users.find(u => u.email === email && u.id !== user.id);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    user.name = name;
    user.email = email;
    user.age = parseInt(age);

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  try {
    const userIndex = users.findIndex(user => user.id === parseInt(req.params.id));
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users.splice(userIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all posts
app.get('/api/posts', (req, res) => {
  try {
    const postsWithAuthors = posts.map(post => ({
      ...post,
      author: findUserById(post.authorId)
    }));
    res.json(postsWithAuthors);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get post by ID
app.get('/api/posts/:id', (req, res) => {
  try {
    const post = findPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const postWithAuthor = {
      ...post,
      author: findUserById(post.authorId)
    };
    
    res.json(postWithAuthor);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new post
app.post('/api/posts', validatePost, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, authorId } = req.body;
    
    // Check if author exists
    const author = findUserById(authorId);
    if (!author) {
      return res.status(400).json({ error: 'Author not found' });
    }

    const newPost = {
      id: posts.length + 1,
      title,
      content,
      authorId: parseInt(authorId),
      createdAt: new Date()
    };

    posts.push(newPost);
    
    const postWithAuthor = {
      ...newPost,
      author
    };
    
    res.status(201).json(postWithAuthor);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users by name or email
app.get('/api/search/users', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchResults = users.filter(user => 
      user.name.toLowerCase().includes(q.toLowerCase()) ||
      user.email.toLowerCase().includes(q.toLowerCase())
    );

    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user statistics
app.get('/api/stats', (req, res) => {
  try {
    const stats = {
      totalUsers: users.length,
      totalPosts: posts.length,
      averageAge: users.reduce((sum, user) => sum + user.age, 0) / users.length,
      postsPerUser: posts.length / users.length
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api`);
  });
}

module.exports = app;