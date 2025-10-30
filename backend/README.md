# Chess2Earn REST API Backend

Complete backend API for the Chess2Earn mobile application.

## Features

- **Authentication**: Passwordless email verification with JWT tokens
- **User Management**: Profile management and Chess.com account linking
- **3-Tier Currency System**: Gems → Diamonds → RTD cryptocurrency
- **Game Analysis**: AI-powered chess game analysis with insights
- **Quests & Missions**: Daily and weekly challenges
- **Social Features**: Friends system and referral program
- **Leaderboards**: Global and friends-only rankings
- **Tournaments**: Multi-format chess tournaments
- **Marketplace**: In-app purchases and inventory system
- **Statistics**: Comprehensive analytics and performance trends

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Email**: Nodemailer
- **External APIs**: Chess.com API
- **Blockchain**: Solana (for RTD withdrawals)

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, validation, rate limiting
│   ├── models/          # Database models
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic (email, chess.com, etc.)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Helper functions
│   └── server.ts        # Main server file
├── database/
│   └── schema.sql       # PostgreSQL database schema
├── .env.example         # Environment variables template
├── package.json
└── tsconfig.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET`
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`
- `SOLANA_RPC_URL`, `SOLANA_WALLET_PRIVATE_KEY` (for withdrawals)

### 3. Set Up Database

```bash
# Create PostgreSQL database
createdb chess2earn

# Run schema migration
psql -U postgres -d chess2earn -f database/schema.sql
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

Base URL: `https://api.chess2earn.com/api`

### 1. Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /verify` - Verify email code
- `POST /resend-code` - Resend verification code
- `POST /login` - Login existing user
- `POST /refresh` - Refresh JWT token

### 2. User Management (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /link-chesscom` - Link Chess.com account
- `POST /verify-chesscom` - Verify Chess.com ownership
- `DELETE /account` - Delete account
- `GET /search` - Search users

### 3. Currency & Wallet (`/api/wallet`)
- `GET /` - Get wallet info
- `GET /transactions` - Transaction history
- `POST /convert/gems-to-diamonds` - Convert gems
- `POST /convert/diamonds-to-rtd` - Convert diamonds
- `POST /withdraw` - Request RTD withdrawal
- `GET /withdrawals` - Withdrawal history

### 4. Games & Analysis (`/api/games`)
- `POST /sync` - Sync Chess.com games
- `GET /` - Get user games
- `POST /:gameId/analyze` - Analyze game
- `GET /:gameId/analysis` - Get analysis results
- `POST /deep-scan` - Deep scan account
- `GET /deep-scan/:scanId` - Get scan results

### 5. Quests & Missions (`/api/quests`, `/api/missions`)
- `GET /quests` - Get active quests
- `POST /quests/:questId/complete` - Complete quest
- `GET /missions/daily` - Daily missions
- `POST /missions/daily/:missionId/complete` - Complete daily mission
- `GET /missions/weekly` - Weekly missions

### 6. Openings & Knowledge (`/api/openings`, `/api/badges`)
- `GET /openings` - Get all openings
- `POST /openings/:openingId/unlock` - Unlock opening
- `GET /badges` - Get user badges
- `GET /knowledge-points/history` - KP history

### 7. Social & Referrals (`/api/referrals`, `/api/friends`)
- `GET /referrals/code` - Get referral code
- `POST /referrals/apply` - Apply referral code
- `GET /referrals/stats` - Referral statistics
- `GET /friends` - Friends list
- `POST /friends/add` - Add friend
- `DELETE /friends/:userId` - Remove friend

### 8. Leaderboard (`/api/leaderboard`)
- `GET /global` - Global leaderboard
- `GET /friends` - Friends leaderboard
- `GET /rank` - User's rank
- `GET /top` - Top players by category

### 9. Tournaments (`/api/tournaments`)
- `GET /` - Active tournaments
- `POST /:tournamentId/join` - Join tournament
- `GET /:tournamentId` - Tournament details
- `GET /:tournamentId/standings` - Tournament standings
- `POST /:tournamentId/results` - Submit result

### 10. Marketplace (`/api/market`)
- `GET /items` - Market items
- `POST /purchase` - Purchase item
- `GET /inventory` - User inventory
- `POST /use` - Use consumable item

### 11. Statistics (`/api/stats`)
- `GET /user` - User statistics
- `GET /trends` - Performance trends
- `GET /openings` - Opening statistics
- `GET /time-controls` - Time control stats

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Express-validator for all inputs
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Password Hashing**: bcrypt for sensitive data
- **SQL Injection Prevention**: Parameterized queries

## Database Schema

14 main tables:
- `users` - User accounts
- `verification_codes` - Email verification
- `games` - Chess games
- `game_analysis` - Game analysis results
- `deep_scans` - Account deep scans
- `transactions` - Currency transactions
- `withdrawals` - RTD withdrawals
- `quests` - Available quests
- `user_quests` - Quest progress
- `openings` - Chess openings
- `badges` - Achievement badges
- `tournaments` - Tournament data
- `market_items` - Marketplace items
- `user_inventory` - User purchases

## Testing

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser"}'
```

## Deployment

### Option 1: Traditional Server
1. Set up PostgreSQL database
2. Configure environment variables
3. Build the project: `npm run build`
4. Run with PM2: `pm2 start dist/server.js`

### Option 2: Docker
```bash
docker build -t chess2earn-api .
docker run -p 3000:3000 --env-file .env chess2earn-api
```

### Option 3: Cloud Platforms
- **Heroku**: Use Heroku Postgres add-on
- **Railway**: PostgreSQL included
- **DigitalOcean App Platform**: Managed database
- **AWS**: EC2 + RDS
- **Google Cloud**: Cloud Run + Cloud SQL

## Environment Variables

See `.env.example` for complete list of required variables.

## API Documentation

Full API documentation: [CHESS2EARN_API_DOCUMENTATION.md](/tmp/upload-3682037446/CHESS2EARN_API_DOCUMENTATION.md)

## Support

- Email: api-support@chess2earn.com
- Documentation: https://docs.chess2earn.com
- Discord: https://discord.gg/chess2earn

## License

MIT License - Copyright (c) 2025 Chess2Earn
