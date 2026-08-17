const db = require("./src/config/db");

async function testDatabase() {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        console.log("MySQL connected successfully");
        console.log(rows);
    } catch (error) {
        console.error("MySQL connection failed:");
        console.error(error.message);
    }
}

testDatabase();