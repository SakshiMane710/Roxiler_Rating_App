require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const name = "System Admin";
        const email = "admin@example.com";
        const password = "Admin@123";
        const address = "Admin HQ";
        const role = "ADMIN";

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [existing] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            console.log("Admin user already exists! You can log in with email: admin@example.com");
            return;
        }

        await connection.execute(
            'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, address, role]
        );

        console.log("✅ Admin user successfully created!");
        console.log("-----------------------------------");
        console.log("Email:    admin@example.com");
        console.log("Password: Admin@123");
        console.log("-----------------------------------");
        console.log("You can now go to the frontend and log in with these credentials.");

    } catch (error) {
        console.error("Error creating admin:", error);
    } finally {
        await connection.end();
    }
}

createAdmin();
