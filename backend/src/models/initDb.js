const db = require('../config/db');

const initializeDatabase = async () => {
  const queryText = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'counsellor', 'admin')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      answers JSONB NOT NULL,
      total_score INT NOT NULL,
      risk_level VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending_review',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id UUID REFERENCES users(id),
      action VARCHAR(255) NOT NULL,
      target_resource VARCHAR(255) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(45)
    );
  `;

  try {
    await db.query(queryText);
    console.log('[DATABASE] Tables initialized successfully.');
  } catch (err) {
    console.error('[DATABASE] Error initializing tables:', err);
  }
};

module.exports = initializeDatabase;