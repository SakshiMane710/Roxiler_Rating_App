const express = require("express");
const { getDashboardData } = require("../controllers/storeOwnerController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("STORE_OWNER"));

router.get("/dashboard", getDashboardData);

module.exports = router;
