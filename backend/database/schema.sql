-- Database Schema for Chess2Earn API

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    chess_com_username VARCHAR(100),
    chess_com_verified BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    bio TEXT,
    country VARCHAR(2),
    gems_balance INTEGER DEFAULT 300,
    diamonds INTEGER DEFAULT 0,
    rtd_balance DECIMAL(20, 8) DEFAULT 0,
    knowledge_points INTEGER DEFAULT 0,
    total_games_analyzed INTEGER DEFAULT 0,
    deep_scans_used INTEGER DEFAULT 0,
    win_streak INTEGER DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by UUID REFERENCES users(id),
    total_referrals INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification Codes Table
CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    user_id UUID REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games Table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chess_com_game_url TEXT NOT NULL,
    result VARCHAR(10) NOT NULL CHECK (result IN ('WIN', 'LOSS', 'DRAW')),
    user_color VARCHAR(5) NOT NULL CHECK (user_color IN ('white', 'black')),
    opponent_username VARCHAR(100),
    opponent_rating INTEGER,
    user_rating INTEGER,
    accuracy DECIMAL(5, 2),
    time_control VARCHAR(50),
    moves INTEGER,
    analyzed BOOLEAN DEFAULT FALSE,
    analysis_id UUID,
    played_at TIMESTAMP NOT NULL,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, chess_com_game_url)
);

-- Game Analysis Table
CREATE TABLE game_analysis (
    analysis_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'QUEUED' CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED')),
    insights JSONB,
    summary JSONB,
    recommendations TEXT[],
    knowledge_points_awarded INTEGER DEFAULT 25,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Deep Scans Table
CREATE TABLE deep_scans (
    scan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PROCESSING' CHECK (status IN ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED')),
    games_analyzed INTEGER DEFAULT 0,
    total_games INTEGER,
    results JSONB,
    diamonds_cost INTEGER DEFAULT 0,
    used_free_weekly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Transactions Table (Gems, Diamonds, RTD)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('EARN', 'SPEND', 'CONVERT', 'WITHDRAWAL', 'REFUND', 'BONUS')),
    currency VARCHAR(10) NOT NULL CHECK (currency IN ('GEMS', 'DIAMONDS', 'RTD')),
    amount DECIMAL(20, 8) NOT NULL,
    balance DECIMAL(20, 8) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawals Table
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(20, 8) NOT NULL,
    fee DECIMAL(20, 8) NOT NULL,
    net_amount DECIMAL(20, 8) NOT NULL,
    wallet_address VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    tx_hash VARCHAR(200),
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Quests Table
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL CHECK (category IN ('ANALYSIS', 'GAMEPLAY', 'SOCIAL', 'LEARNING', 'DAILY')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD', 'EXPERT')),
    requirement JSONB NOT NULL,
    rewards JSONB NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Quests (Progress tracking)
CREATE TABLE user_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS' CHECK (status IN ('AVAILABLE', 'IN_PROGRESS', 'COMPLETED')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, quest_id)
);

-- Daily Missions Table
CREATE TABLE daily_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mission_date DATE NOT NULL,
    missions JSONB NOT NULL,
    completed_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, mission_date)
);

-- Weekly Missions Table
CREATE TABLE weekly_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_number INTEGER NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    missions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Weekly Missions Progress
CREATE TABLE user_weekly_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES weekly_missions(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS',
    completed_at TIMESTAMP,
    UNIQUE(user_id, mission_id)
);

-- Openings Table
CREATE TABLE openings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    family VARCHAR(50),
    description TEXT,
    moves TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')),
    knowledge_points_required INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Openings (Unlocked status)
CREATE TABLE user_openings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opening_id UUID REFERENCES openings(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    UNIQUE(user_id, opening_id)
);

-- Badges Table
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opening_id UUID REFERENCES openings(id) ON DELETE CASCADE,
    tier VARCHAR(10) CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD')),
    requirement INTEGER NOT NULL,
    kp_reward INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(opening_id, tier)
);

-- User Badges (Earned badges)
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Knowledge Points History
CREATE TABLE kp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) CHECK (type IN ('EARN', 'SPEND')),
    amount INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    source TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals Table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    gems_earned INTEGER DEFAULT 0,
    diamonds_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(referrer_id, referred_id)
);

-- Friends Table
CREATE TABLE friends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- Tournaments Table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('BLITZ', 'RAPID', 'BULLET', 'DAILY')),
    format VARCHAR(20) CHECK (format IN ('SWISS', 'KNOCKOUT', 'ARENA', 'ROUND_ROBIN')),
    status VARCHAR(20) DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'OPEN', 'IN_PROGRESS', 'COMPLETED')),
    entry_fee JSONB,
    prize_pool JSONB,
    participants INTEGER DEFAULT 0,
    max_participants INTEGER,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    time_control VARCHAR(20),
    current_round INTEGER,
    total_rounds INTEGER,
    rules TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament Participants
CREATE TABLE tournament_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    participant_number INTEGER,
    current_rank INTEGER,
    points DECIMAL(5, 2) DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, user_id)
);

-- Marketplace Items
CREATE TABLE market_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(20) CHECK (category IN ('BOOST', 'COSMETIC', 'UTILITY', 'BUNDLE')),
    type VARCHAR(20) CHECK (type IN ('CONSUMABLE', 'PERMANENT')),
    price JSONB NOT NULL,
    duration INTEGER,
    effect JSONB,
    image TEXT,
    popularity DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Inventory
CREATE TABLE user_inventory (
    inventory_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES market_items(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'UNUSED' CHECK (status IN ('UNUSED', 'ACTIVE', 'EXPIRED', 'EQUIPPED')),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activated_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_games_played_at ON games(played_at DESC);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
