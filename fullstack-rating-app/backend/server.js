const express = require("express");

const app = express();

app.use(express.json());

const db = require("./src/config/db");

const testRoutes = require("./src/routes/testRoutes");
const authRoutes = require("./src/routes/authRoutes");
const storeRoutes = require("./src/routes/storeRoutes");
const ratingRoutes = require("./src/routes/ratingRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const storeOwnerRoutes = require("./src/routes/storeOwnerRoutes");

const PORT = 5000;

app.use("/", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes); 
app.use("/api/ratings", ratingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/store-owner", storeOwnerRoutes);

app.get("/", (req, res) => {
    res.send("Rating Application Backend is Running");
});

app.get("/test-roles", async (req, res) => {
    await db.query("UPDATE users SET role='ADMIN' WHERE email='admin_test@test.com'");
    await db.query("UPDATE users SET role='STORE_OWNER' WHERE email='owner_test@test.com'");
    res.send("Test roles upgraded");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});