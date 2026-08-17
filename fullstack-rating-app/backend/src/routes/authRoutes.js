const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.get(
    "/profile",
    authMiddleware,
    authController.getProfile
);

router.put(
    "/change-password",
    authMiddleware,
    authController.changePassword
);

router.get(
    "/admin-test",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => {
        res.status(200).json({
            message: "Welcome Admin",
            user: req.user
        });
    }
);

module.exports = router;