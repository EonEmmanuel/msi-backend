import pkg from 'pg'
import dotenv from 'dotenv'

const { Pool } = pkg

dotenv.config()

const db = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_6AvDWHfrB4YR@ep-sweet-pond-anauchh0-pooler.c-6.us-east-1.aws.neon.tech/MSI?sslmode=require&channel_binding=require',
});
 
  async function testConnection() {
    try {
      const client = await db.connect();
      console.log('Connected to PgAdmin database successfully !!!');
      client.release();
    } catch (err) {
      console.error('Error connecting to the database:', err.stack);
    }
  }
  
  testConnection();

export default db;
