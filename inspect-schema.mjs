import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function inspectSchema() {
    console.log('Inspecting schema on:', process.env.DB_HOST);
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        console.log('\n--- Table: content_items ---');
        const [columnsItems] = await connection.query('DESCRIBE content_items');
        console.table(columnsItems);

        console.log('\n--- Table: content_categories ---');
        const [columnsCats] = await connection.query('DESCRIBE content_categories');
        console.table(columnsCats);

        await connection.end();
    } catch (error) {
        console.error('Inspection failed:', error.message);
    }
}

inspectSchema();
