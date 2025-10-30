# Chess2Earn API - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Git installed

### Step 1: Environment Setup (1 minute)

```bash
cd /home/vibecode/workspace/backend

# Copy environment template
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Minimum required settings:**
```bash
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

### Step 2: Database Setup (2 minutes)

```bash
# Create database
psql -U postgres -c "CREATE DATABASE chess2earn;"

# Run migrations
psql -U postgres -d chess2earn -f database/schema.sql

# Verify tables created
psql -U postgres -d chess2earn -c "\dt"
```

You should see 14 tables created.

### Step 3: Install Dependencies (Already Done! ✅)

```bash
npm install  # Already completed
```

### Step 4: Start Server (30 seconds)

```bash
# Development mode with auto-reload
npm run dev

# OR production mode
npm run build
npm start
```

### Step 5: Test the API (1 minute)

```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
{
  "success": true,
  "message": "Chess2Earn API is running",
  "timestamp": "2025-01-20T...",
  "uptime": 5.123
}
```

---

## 🧪 Testing Authentication

### Test the full auth flow:

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "chessmaster"
  }'

# Expected: 201 Created with verification code sent to email

# 2. Verify (use code from email)
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'

# Expected: 200 OK with JWT token and user data

# 3. Use token for authenticated requests
TOKEN="your_jwt_token_from_step_2"

curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# Expected: User profile data
```

---

## 🐳 Docker Quick Start (Alternative)

If you prefer Docker:

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop
docker-compose down
```

---

## 📧 Email Setup

### For Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Generate App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated 16-character password
   - Use this in `.env` as `EMAIL_PASSWORD`

### For Other Providers:

Update `.env` with your SMTP settings:
```bash
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email
EMAIL_PASSWORD=your-password
```

---

## 🔍 Troubleshooting

### Issue: "Database connection failed"
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Test connection
psql -U postgres -c "SELECT version();"
```

### Issue: "Port 3000 already in use"
```bash
# Find what's using port 3000
lsof -i :3000

# Change port in .env
PORT=3001
```

### Issue: "Cannot find module..."
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Email not sending"
```bash
# Test email credentials
node -e "
const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transport.verify().then(() => console.log('✅ Email configured correctly'))
  .catch(err => console.error('❌ Email error:', err));
"
```

---

## 📝 Development Workflow

### File Structure for Adding New Features:

```
1. Create controller in src/controllers/
2. Create routes in src/routes/
3. Add validation in src/middleware/validation.ts
4. Test with curl or Postman
```

### Example: Adding a new endpoint

```typescript
// 1. src/controllers/user.controller.ts
export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId; // from auth middleware
      const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      res.json({ success: true, data: user.rows[0] });
    } catch (error) {
      next(error);
    }
  }
}

// 2. src/routes/user.routes.ts
import { UserController } from '../controllers/user.controller';
router.get('/profile', authenticateToken, UserController.getProfile);
```

---

## 🎯 What to Build Next

### Priority Order:

1. **User Profile Endpoints** (2-3 hours)
   - GET /api/users/profile
   - PUT /api/users/profile
   - POST /api/users/link-chesscom
   - POST /api/users/verify-chesscom

2. **Wallet System** (3-4 hours)
   - GET /api/wallet
   - GET /api/wallet/transactions
   - POST /api/wallet/convert/gems-to-diamonds
   - POST /api/wallet/convert/diamonds-to-rtd

3. **Game Sync** (4-5 hours)
   - POST /api/games/sync
   - GET /api/games

4. **Continue with other modules...**

---

## 📚 Useful Commands

```bash
# Check server status
npm run dev

# Build for production
npm run build

# View database
psql -U postgres -d chess2earn

# Check all tables
psql -U postgres -d chess2earn -c "\dt"

# View users
psql -U postgres -d chess2earn -c "SELECT * FROM users;"

# Clear verification codes
psql -U postgres -d chess2earn -c "DELETE FROM verification_codes;"

# Reset a user (for testing)
psql -U postgres -d chess2earn -c "UPDATE users SET verified=false WHERE email='test@example.com';"
```

---

## 🆘 Support

- **Documentation**: `backend/README.md`
- **API Spec**: `CHESS2EARN_API_DOCUMENTATION.md`
- **Implementation Status**: `IMPLEMENTATION_SUMMARY.md`
- **Database Schema**: `database/schema.sql`

---

**You're all set! 🎉**

The authentication system is fully working. Start the server and test it with the commands above!
