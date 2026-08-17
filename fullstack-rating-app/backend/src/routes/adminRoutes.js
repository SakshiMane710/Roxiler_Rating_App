const express = require("express");
const { 
    getDashboardData,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
    getAllRatings,
    deleteAdminRating
} = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// All admin routes are protected and require the ADMIN role
router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/dashboard", getDashboardData);

// Admin User Management Routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Admin Store Management Routes
router.get("/stores", getAllStores);
router.get("/stores/:id", getStoreById);
router.post("/stores", createStore);
router.put("/stores/:id", updateStore);
router.delete("/stores/:id", deleteStore);

// Admin Rating Management Routes
router.get("/ratings", getAllRatings);
router.delete("/ratings/:id", deleteAdminRating);

module.exports = router;