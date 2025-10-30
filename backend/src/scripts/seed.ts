import { getDatabase, initializeSchema } from '../config/database.sqlite.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Generate random data helpers
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  const db = getDatabase();

  // Initialize schema
  initializeSchema();

  // Clear existing data
  db.exec(`DELETE FROM user_quests`);
  db.exec(`DELETE FROM game_analysis`);
  db.exec(`DELETE FROM games`);
  db.exec(`DELETE FROM withdrawals`);
  db.exec(`DELETE FROM transactions`);
  db.exec(`DELETE FROM verification_codes`);
  db.exec(`DELETE FROM users`);

  console.log('✅ Cleared existing data');

  // Test users data
  const testUsers = [
    {
      username: 'hikaru',
      email: 'cryptodaj@gmail.com',
      verified: true,
      elo_rating: 2800,
      gems_balance: 5000,
      diamonds: 150,
      rtd_balance: 2.5,
      knowledge_points: 8500,
      total_games_played: 250,
      total_games_analyzed: 180
    },
    {
      username: 'magnuscarlsen',
      email: 'magnus.test@chess2earn.com',
      verified: true,
      elo_rating: 2850,
      gems_balance: 8000,
      diamonds: 200,
      rtd_balance: 5.0,
      knowledge_points: 12000,
      total_games_played: 500,
      total_games_analyzed: 350
    },
    {
      username: 'chesslover23',
      email: 'chess.lover@gmail.com',
      verified: true,
      elo_rating: 1650,
      gems_balance: 2000,
      diamonds: 50,
      rtd_balance: 0.5,
      knowledge_points: 3200,
      total_games_played: 120,
      total_games_analyzed: 75
    },
    {
      username: 'rookieplayer',
      email: 'rookie@chess2earn.com',
      verified: false,
      elo_rating: 1200,
      gems_balance: 500,
      diamonds: 10,
      rtd_balance: 0,
      knowledge_points: 500,
      total_games_played: 25,
      total_games_analyzed: 10
    },
    {
      username: 'tacticmaster',
      email: 'tactics@chess2earn.com',
      verified: true,
      elo_rating: 2100,
      gems_balance: 4200,
      diamonds: 85,
      rtd_balance: 1.2,
      knowledge_points: 5800,
      total_games_played: 180,
      total_games_analyzed: 140
    },
    {
      username: 'endgamepro',
      email: 'endgame@chess2earn.com',
      verified: true,
      elo_rating: 2300,
      gems_balance: 6500,
      diamonds: 120,
      rtd_balance: 2.8,
      knowledge_points: 7200,
      total_games_played: 320,
      total_games_analyzed: 250
    },
    {
      username: 'blitzking',
      email: 'blitz@chess2earn.com',
      verified: true,
      elo_rating: 1950,
      gems_balance: 3500,
      diamonds: 70,
      rtd_balance: 0.8,
      knowledge_points: 4500,
      total_games_played: 450,
      total_games_analyzed: 120
    },
    {
      username: 'casualchess',
      email: 'casual@chess2earn.com',
      verified: true,
      elo_rating: 1450,
      gems_balance: 1200,
      diamonds: 25,
      rtd_balance: 0.2,
      knowledge_points: 1800,
      total_games_played: 65,
      total_games_analyzed: 35
    },
    {
      username: 'strategist99',
      email: 'strategy@chess2earn.com',
      verified: true,
      elo_rating: 1800,
      gems_balance: 2800,
      diamonds: 60,
      rtd_balance: 0.6,
      knowledge_points: 3900,
      total_games_played: 150,
      total_games_analyzed: 95
    },
    {
      username: 'chessnoob',
      email: 'noob@chess2earn.com',
      verified: false,
      elo_rating: 1100,
      gems_balance: 350,
      diamonds: 5,
      rtd_balance: 0,
      knowledge_points: 200,
      total_games_played: 15,
      total_games_analyzed: 5
    }
  ];

  // Hash password (same for all test users: "password123")
  const passwordHash = await bcrypt.hash('password123', 10);

  // Insert users
  const insertUser = db.prepare(`
    INSERT INTO users (
      id, username, email, password_hash, verified, elo_rating,
      gems_balance, diamonds, rtd_balance, knowledge_points,
      total_games_played, total_games_analyzed, referral_code, created_at, last_login_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (const user of testUsers) {
    const userId = uuidv4();
    const createdAt = randomDate(thirtyDaysAgo, now);
    const lastLoginAt = user.verified ? randomDate(new Date(createdAt), now) : null;
    const referralCode = `REF${randomInt(100000, 999999)}`;

    insertUser.run(
      userId,
      user.username,
      user.email,
      passwordHash,
      user.verified ? 1 : 0,
      user.elo_rating,
      user.gems_balance,
      user.diamonds,
      user.rtd_balance,
      user.knowledge_points,
      user.total_games_played,
      user.total_games_analyzed,
      referralCode,
      createdAt,
      lastLoginAt
    );

    console.log(`✅ Created user: ${user.username} (${user.email})`);

    // Create some transactions for each user
    if (user.verified) {
      const insertTransaction = db.prepare(`
        INSERT INTO transactions (id, user_id, type, currency, amount, balance_before, balance_after, description, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Welcome bonus
      insertTransaction.run(
        uuidv4(),
        userId,
        'BONUS',
        'GEMS',
        300,
        0,
        300,
        'Welcome bonus',
        createdAt
      );

      // Random earnings
      for (let i = 0; i < randomInt(3, 8); i++) {
        const amount = randomInt(50, 200);
        insertTransaction.run(
          uuidv4(),
          userId,
          'EARN',
          'GEMS',
          amount,
          0,
          amount,
          'Game analysis reward',
          randomDate(new Date(createdAt), now)
        );
      }
    }
  }

  console.log('✅ Created 10 test users with transactions');

  // Create some sample quests
  const quests = [
    {
      title: 'Analyze 5 Games',
      description: 'Complete 5 game analyses to improve your chess understanding',
      category: 'ANALYSIS',
      difficulty: 'EASY',
      type: 'DAILY',
      target_value: 5,
      reward_gems: 100,
      reward_kp: 50
    },
    {
      title: 'Win 10 Games',
      description: 'Win 10 games on Chess.com',
      category: 'GAMEPLAY',
      difficulty: 'MEDIUM',
      type: 'WEEKLY',
      target_value: 10,
      reward_gems: 500,
      reward_diamonds: 5,
      reward_kp: 200
    },
    {
      title: 'Master Opening Repertoire',
      description: 'Study and master 3 different openings',
      category: 'LEARNING',
      difficulty: 'HARD',
      type: 'SPECIAL',
      target_value: 3,
      reward_diamonds: 20,
      reward_kp: 500
    }
  ];

  const insertQuest = db.prepare(`
    INSERT INTO quests (id, title, description, category, difficulty, type, target_value, reward_gems, reward_diamonds, reward_kp, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const quest of quests) {
    insertQuest.run(
      uuidv4(),
      quest.title,
      quest.description,
      quest.category,
      quest.difficulty,
      quest.type,
      quest.target_value,
      quest.reward_gems || 0,
      quest.reward_diamonds || 0,
      quest.reward_kp,
      1,
      new Date().toISOString()
    );
  }

  console.log('✅ Created sample quests');

  // Get user count
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const transactionCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get() as { count: number };

  console.log('\n🎉 Database seeded successfully!');
  console.log(`📊 Stats:`);
  console.log(`   - Users: ${userCount.count}`);
  console.log(`   - Transactions: ${transactionCount.count}`);
  console.log(`   - Quests: ${quests.length}`);
  console.log(`\n🔐 Test Login Credentials:`);
  console.log(`   Email: cryptodaj@gmail.com`);
  console.log(`   Username: hikaru`);
  console.log(`   Password: password123`);
  console.log(`\n   (All test users use password: password123)`);
}

// Run seed
seedDatabase().catch(console.error);
