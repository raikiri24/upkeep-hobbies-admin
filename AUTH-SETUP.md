# Test Auth Server for localhost:4000

## Expected API Endpoints

### 1. POST /upk/auth
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "accessToken": "your-jwt-token-or-access-key",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "User Name",
    "avatar": "https://example.com/avatar.jpg",
    "isAdmin": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Authentication successful"
}
```

### 2. POST /upk/auth/verify (Optional - for token validation)
**Request Body:**
```json
{
  "accessToken": "your-jwt-token-or-access-key"
}
```

**Expected Response:**
```json
{
  "valid": true,
  "expired": false,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "User Name",
    "isAdmin": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Node.js Example Server

```javascript
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Mock user database
const users = [
  {
    id: 'admin-1',
    email: 'admin@upkeep.com',
    password: 'password123',
    name: 'Admin User',
    isAdmin: true
  },
  {
    id: 'user-1',
    email: 'user@upkeep.com',
    password: 'user123',
    name: 'Regular User',
    isAdmin: false
  }
];

const JWT_SECRET = 'your-secret-key';

// Login endpoint
app.post('/upk/auth', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  
  // Generate JWT
  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    accessToken: token, // Use accessToken to match your API
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      createdAt: new Date().toISOString()
    },
    message: 'Authentication successful'
  });
});

// Verify token endpoint
app.post('/upk/auth/verify', (req, res) => {
  const { accessToken, accessKey } = req.body;
  const tokenToVerify = accessToken || accessKey; // Support both formats
  
  try {
    const decoded = jwt.verify(tokenToVerify, JWT_SECRET);
    
    // Find user
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.json({ valid: false, expired: true });
    }
    
    res.json({
      valid: true,
      expired: false,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.json({ valid: false, expired: true });
  }
});

app.listen(4000, () => {
  console.log('🚀 Auth server running on http://localhost:4000');
  console.log('📝 Test credentials:');
  console.log('   Admin: admin@upkeep.com / password123');
  console.log('   User:  user@upkeep.com / user123');
});
```

## How to Use

1. **Start the server:**
   ```bash
   npm install express cors jsonwebtoken
   node auth-server.js
   ```

2. **Test with React SPA:**
   - Navigate to your React app
   - Check "Use Local Auth Server" 
   - Login with `admin@upkeep.com` / `password123`

3. **Features:**
   - ✅ JWT authentication
   - ✅ Role-based access (admin/editor)
   - ✅ Token expiration handling
   - ✅ CORS support for React app
   - ✅ Error handling

## Frontend Integration

Your React SPA is already configured to:
1. Use local auth when `USE_LOCAL_AUTH = true`
2. Verify tokens on app load
3. Handle token expiration
4. Map `isAdmin` to proper roles
5. Store tokens in localStorage

The integration automatically handles the difference between your `accessKey` response and expected `token` format!