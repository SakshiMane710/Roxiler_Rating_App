const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

async function setup() {
    const hashedPassword = await bcrypt.hash('password', 10);
    
    await db.execute(`
        INSERT INTO users (name, email, password, address, role) 
        VALUES ('Admin', 'admin@test.com', ?, 'Admin HQ', 'ADMIN')
        ON DUPLICATE KEY UPDATE password = ?, role = 'ADMIN'
    `, [hashedPassword, hashedPassword]);

    await db.execute(`
        INSERT INTO users (name, email, password, address, role) 
        VALUES ('Owner', 'owner@test.com', ?, 'Owner HQ', 'STORE_OWNER')
        ON DUPLICATE KEY UPDATE password = ?, role = 'STORE_OWNER'
    `, [hashedPassword, hashedPassword]);

    await db.execute(`
        INSERT INTO users (name, email, password, address, role) 
        VALUES ('User', 'user@test.com', ?, 'User HQ', 'USER')
        ON DUPLICATE KEY UPDATE password = ?, role = 'USER'
    `, [hashedPassword, hashedPassword]);

    console.log("Users setup complete");
    process.exit(0);
}

setup().catch(console.error);
