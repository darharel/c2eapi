import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { getDatabase, initializeSchema } from './config/database.sqlite';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import walletRoutes from './routes/wallet.routes';
import gamesRoutes from './routes/games.routes';
import questsRoutes from './routes/quests.routes';
import openingsRoutes from './routes/openings.routes';
import socialRoutes from './routes/social.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import tournamentsRoutes from './routes/tournaments.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import statsRoutes from './routes/stats.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS configuration for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Chess2Earn API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/quests', questsRoutes);
app.use('/api/missions', questsRoutes); // Reuse quests routes for missions
app.use('/api/openings', openingsRoutes);
app.use('/api/badges', openingsRoutes); // Reuse openings routes for badges
app.use('/api/knowledge-points', openingsRoutes); // Reuse openings routes for KP
app.use('/api/referrals', socialRoutes);
app.use('/api/friends', socialRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/market', marketplaceRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'ENDPOINT_NOT_FOUND'
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize SQLite database
    try {
      const db = getDatabase();
      initializeSchema();
      console.log('✅ SQLite Database connected successfully');
    } catch (dbError: any) {
      console.warn('⚠️  Database connection failed:', dbError.message);
      console.warn('⚠️  Server will run but database operations will fail');
    }

    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Chess2Earn API Server Started Successfully!');
      console.log('='.repeat(60));
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🔗 API Base: ${process.env.API_BASE_URL || `http://localhost:${PORT}/api`}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log('='.repeat(60));
      console.log('\n📝 Available Endpoints:');
      console.log('   GET  /health                - Server health check');
      console.log('   POST /api/auth/register     - Register new user');
      console.log('   POST /api/auth/verify       - Verify email code');
      console.log('   POST /api/auth/login        - Login existing user');
      console.log('   POST /api/auth/refresh      - Refresh JWT token');
      console.log('\n💡 Test with: curl http://localhost:${PORT}/health');
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
