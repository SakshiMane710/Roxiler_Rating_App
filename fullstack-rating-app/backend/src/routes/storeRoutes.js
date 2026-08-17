const express = require("express");

const router = express.Router();

const {
    getAllStores,
    getStoreById,
    createStore
} = require("../controllers/storeController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, getAllStores);

router.get("/:id", authMiddleware, getStoreById);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createStore
);

module.exports = router;