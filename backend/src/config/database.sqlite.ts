import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = path.join(__dirname, '../../data/chess2earn.db');

// Create database instance
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require('fs');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
    });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    console.log('✅ SQLite database connected:', DB_PATH);
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('✅ SQLite database connection closed');
  }
}

// Initialize database schema
export function initializeSchema() {
  const db = getDatabase();

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      verified INTEGER DEFAULT 0,
      chess_com_username TEXT,
      elo_rating INTEGER DEFAULT 1200,
      gems_balance REAL DEFAULT 300,
      diamonds REAL DEFAULT 0,
      rtd_balance REAL DEFAULT 0,
      knowledge_points INTEGER DEFAULT 0,
      total_games_played INTEGER DEFAULT 0,
      total_games_analyzed INTEGER DEFAULT 0,
      referral_code TEXT UNIQUE,
      referred_by TEXT,
      banned INTEGER DEFAULT 0,
      ban_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_login_at TEXT,
      FOREIGN KEY (referred_by) REFERENCES users(id)
    )
  `);

  // Verification codes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      code TEXT NOT NULL,
      type TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      currency TEXT NOT NULL,
      amount REAL NOT NULL,
      balance_before REAL NOT NULL,
      balance_after REAL NOT NULL,
      description TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Games table
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      chess_com_game_id TEXT UNIQUE,
      pgn TEXT NOT NULL,
      result TEXT NOT NULL,
      time_control TEXT,
      white_player TEXT NOT NULL,
      black_player TEXT NOT NULL,
      played_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Game analysis table
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_analysis (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      analysis_type TEXT NOT NULL,
      cost_gems INTEGER,
      cost_diamonds INTEGER,
      kp_earned INTEGER DEFAULT 0,
      mistakes INTEGER DEFAULT 0,
      blunders INTEGER DEFAULT 0,
      accuracy REAL,
      analysis_data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Withdrawals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      fee REAL NOT NULL,
      net_amount REAL NOT NULL,
      wallet_address TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      tx_hash TEXT,
      error_message TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      processed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Quests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      type TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      reward_gems INTEGER DEFAULT 0,
      reward_diamonds INTEGER DEFAULT 0,
      reward_kp INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      starts_at TEXT,
      ends_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User quests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_quests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      quest_id TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      claimed INTEGER DEFAULT 0,
      started_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_games_user ON games(user_id);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
    CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
  `);

  console.log('✅ Database schema initialized');
}

export default getDatabase;
