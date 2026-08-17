const express = require("express");

const router = express.Router();

const {
    createRating,
    getStoreRatings,
    updateRating,
    deleteRating
} = require("../controllers/ratingController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/",
    authMiddleware,
    createRating
);

router.get(
    "/store/:id",
    getStoreRatings
);

router.put(
    "/",
    authMiddleware,
    updateRating
);

router.delete(
    "/",
    authMiddleware,
    deleteRating
);

module.exports = router;