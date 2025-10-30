import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'chess2earn',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('📦 Database pool connected');
});

pool.on('error', (err: Error) => {
  console.error('❌ Database error:', err.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(-1);
  }
});

export default pool;
