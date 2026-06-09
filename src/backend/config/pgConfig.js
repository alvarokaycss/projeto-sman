const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URI,
});

pool.on('connect', () => {
    console.log('PG: PostgreSQL: Conectado com sucesso através do Pool!');
});

pool.on('error', (err) => {
    console.error('PG: Erro inesperado no cliente do PostgreSQL Pool:', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
