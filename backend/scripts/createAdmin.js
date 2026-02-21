const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const isProduction = process.env.NODE_ENV === 'production';

const pool = hasDatabaseUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : false,
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'scouting_app',
      port: Number(process.env.DB_PORT || 5432),
    });

async function createAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Team 1334 Admin';
    const adminTeamNumber = Number(process.env.ADMIN_TEAM_NUMBER || 1334);

    if (!adminEmail || !adminPassword) {
      throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running createAdmin');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const now = new Date().toISOString();
    
    const query = `
      INSERT INTO users (name, email, password, "teamNumber", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name,
          password = EXCLUDED.password,
          "teamNumber" = EXCLUDED."teamNumber",
          "updatedAt" = EXCLUDED."updatedAt"
    `;
    
    await pool.query(query, [
      adminName,
      adminEmail,
      hashedPassword,
      Number.isNaN(adminTeamNumber) ? 1334 : adminTeamNumber,
      now,
      now
    ]);
    
    console.log(`Admin user upserted successfully: ${adminEmail}`);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    pool.end();
  }
}

createAdmin(); 
