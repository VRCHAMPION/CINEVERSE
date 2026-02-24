const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.ztiyptobcmxhizuvmspf:Cineverse@2025@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Connection Error:', err.message);
    } else {
        console.log('✅ Connected to Supabase! Time:', res.rows[0].now);
    }
});

module.exports = pool;