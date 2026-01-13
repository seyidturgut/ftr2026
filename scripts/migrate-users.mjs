import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

// Load env vars from .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const dbConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

async function migrate() {
    console.log('--- Migration Started ---');
    console.log(`Connecting to database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);

    const connection = await mysql.createConnection(dbConfig);

    try {
        const csvPath = 'ftr-users - ftr-users.csv';
        const fileContent = fs.readFileSync(csvPath, 'utf-8');

        console.log('Parsing CSV...');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        console.log(`Found ${records.length} records in CSV.`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const [index, row] of records.entries()) {
            const {
                user_login,
                user_pass,
                user_email,
                first_name,
                last_name,
                display_name,
                roles
            } = row;

            // Basic validation
            if (!user_login || !user_email) {
                console.warn(`[Row ${index + 1}] Missing login or email, skipping.`);
                skipCount++;
                continue;
            }

            try {
                // Check if user exists
                const [existing] = await connection.execute(
                    'SELECT id FROM users WHERE username = ? OR email = ?',
                    [user_login, user_email]
                );

                if (existing.length > 0) {
                    // console.log(`[Row ${index + 1}] User ${user_login} already exists, skipping.`);
                    skipCount++;
                    continue;
                }

                // Insert user
                // role defaults to editor, limits to 5/100 as per system standards
                await connection.execute(
                    `INSERT INTO users (
                        username, 
                        email, 
                        password, 
                        first_name, 
                        last_name, 
                        role, 
                        is_active, 
                        daily_download_limit, 
                        monthly_download_limit,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [
                        user_login,
                        user_email,
                        user_pass, // Storing hash directly (hybrid support enabled in login)
                        first_name || display_name || user_login,
                        last_name || '',
                        'editor', // Force 'editor' (which UI maps to Abone)
                        1,        // active
                        5,        // daily limit
                        100       // monthly limit
                    ]
                );

                successCount++;
                if (successCount % 100 === 0) {
                    console.log(`Progress: ${successCount} users imported...`);
                }
            } catch (err) {
                console.error(`[Row ${index + 1}] Error importing ${user_login}:`, err.message);
                errorCount++;
            }
        }

        console.log('\n--- Migration Completed ---');
        console.log(`Successfully imported: ${successCount}`);
        console.log(`Skipped (already exist): ${skipCount}`);
        console.log(`Errors: ${errorCount}`);
        console.log('---------------------------');

    } catch (error) {
        console.error('Fatal Migration Error:', error);
    } finally {
        await connection.end();
    }
}

migrate();
