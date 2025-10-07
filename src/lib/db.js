// lib/db.js
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Setup SSL configuration
let sslConfig = {};

// Priority: Environment variable > ca.pem file > No SSL
if (process.env.DB_CA_CERT) {
  // Production: Read from environment variable
  console.log('📜 Using SSL certificate from environment variable');
  sslConfig = {
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.DB_CA_CERT,
    }
  };
} else {
  // Development: Try to read from ca.pem file
  try {
    const certPath = path.join(process.cwd(), 'ca.pem');
    
    if (fs.existsSync(certPath)) {
      console.log('📜 Using SSL certificate from ca.pem file');
      sslConfig = {
        ssl: {
          rejectUnauthorized: true,
          ca: fs.readFileSync(certPath).toString(),
        }
      };
    } else {
      console.log('⚠️  No SSL certificate found (no env var or ca.pem file)');
      sslConfig = {
        ssl: false
      };
    }
  } catch (error) {
    console.warn('⚠️  Error reading SSL certificate:', error.message);
    sslConfig = { ssl: false };
  }
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ...sslConfig
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`✓ Query executed in ${duration}ms - ${res.rowCount} rows`);
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('Query:', text);
    console.error('Params:', params);
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  const timeout = setTimeout(() => {
    console.error('⚠️  A client has been checked out for more than 5 seconds!');
  }, 5000);

  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => {
    console.log('🚀 Database connection pool initialized successfully');
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database connection:', err.message);
    console.error('Please check your database credentials in .env.local');
  });

export default pool;