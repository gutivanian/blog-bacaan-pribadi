// lib/db.js
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Read SSL certificate for Aiven
let sslConfig = false;

// Try to read ca.pem from root directory
try {
  const caPath = path.join(process.cwd(), 'ca.pem');
  if (fs.existsSync(caPath)) {
    const ca = fs.readFileSync(caPath, 'utf8');
    sslConfig = {
      rejectUnauthorized: true,
      ca: ca,
    };
    console.log('✅ SSL certificate loaded successfully from ca.pem');
  } else {
    console.warn('⚠️ ca.pem not found. Attempting connection without SSL.');
  }
} catch (error) {
  console.error('❌ Error reading SSL certificate:', error.message);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: sslConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased for cloud connections
});

// Test connection
pool.on('connect', (client) => {
  console.log('✅ Connected to PostgreSQL database');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   SSL: ${sslConfig ? 'Enabled' : 'Disabled'}`);
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message);
  console.error('   Code:', err.code);
  
  if (err.code === '28000') {
    console.error('   💡 Authentication failed. Check:');
    console.error('      - DB_USER and DB_PASSWORD in .env.local');
    console.error('      - SSL certificate (ca.pem) is present');
    console.error('      - Database allows connections from your IP');
  }
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Query executed', { 
      query: text.substring(0, 50) + '...', 
      duration: `${duration}ms`, 
      rows: res.rowCount 
    });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    console.error('   Query:', text);
    console.error('   Code:', error.code);
    
    // Provide helpful error messages
    if (error.code === '28000') {
      console.error('   💡 Authentication error - check credentials');
    } else if (error.code === '3D000') {
      console.error('   💡 Database does not exist');
    } else if (error.code === '42P01') {
      console.error('   💡 Table does not exist - run database setup');
    }
    
    throw error;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 10 seconds for cloud connections
  const timeout = setTimeout(() => {
    console.error('⚠️ A client has been checked out for more than 10 seconds!');
    console.error('   Last query:', client.lastQuery);
  }, 10000);

  // Monkey patch the query method to keep track of the last query executed
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

export default pool;