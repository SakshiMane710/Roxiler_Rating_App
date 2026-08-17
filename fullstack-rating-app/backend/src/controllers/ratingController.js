const db = require("../config/db");

const createRating = async (req, res) => {
    try {
        const { store_id, rating } = req.body;

        const user_id = req.user.id;

        // 1. Validate required fields
        if (!store_id || !rating) {
            return res.status(400).json({
                message: "Store ID and rating are required"
            });
        }

        // 2. Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // 3. Check whether user exists
        const [users] = await db.query(
            "SELECT id FROM users WHERE id = ?",
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 4. Check whether store exists
        const [stores] = await db.query(
            "SELECT id FROM stores WHERE id = ?",
            [store_id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        // 5. Check whether user already rated this store
        const [existingRatings] = await db.query(
            "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
            [user_id, store_id]
        );

        if (existingRatings.length > 0) {
            return res.status(409).json({
                message: "You have already rated this store"
            });
        }

        // 6. Insert rating
        const [result] = await db.query(
            `INSERT INTO ratings (user_id, store_id, rating)
             VALUES (?, ?, ?)`,
            [user_id, store_id, rating]
        );

        // 7. Send success response
        res.status(201).json({
            message: "Rating submitted successfully",
            ratingId: result.insertId
        });

    } catch (error) {
        console.error("Create rating error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getStoreRatings = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check whether store exists
        const [stores] = await db.query(
            "SELECT id, name FROM stores WHERE id = ?",
            [id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        // 2. Get ratings with user names
        const [ratings] = await db.query(
            `SELECT 
                ratings.id,
                ratings.user_id,
                users.name,
                ratings.rating
             FROM ratings
             JOIN users ON ratings.user_id = users.id
             WHERE ratings.store_id = ?`,
            [id]
        );

        // 3. Calculate average rating
        let averageRating = 0;

        if (ratings.length > 0) {
            const total = ratings.reduce(
                (sum, item) => sum + item.rating,
                0
            );

            averageRating = total / ratings.length;
        }

        // 4. Send response
        res.status(200).json({
            store: stores[0],
            totalRatings: ratings.length,
            averageRating: averageRating,
            ratings: ratings
        });

    } catch (error) {
        console.error("Get store ratings error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const updateRating = async (req, res) => {
    try {
        const { store_id, rating } = req.body;

        const user_id = req.user.id;

        // 1. Validate required fields
        if (!store_id || !rating) {
            return res.status(400).json({
                message: "Store ID and rating are required"
            });
        }

        // 2. Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // 3. Check whether rating exists for this user and store
        const [existingRatings] = await db.query(
            "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
            [user_id, store_id]
        );

        if (existingRatings.length === 0) {
            return res.status(404).json({
                message: "Rating not found"
            });
        }

        // 4. Update rating
        await db.query(
            "UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?",
            [rating, user_id, store_id]
        );

        // 5. Send success response
        res.status(200).json({
            message: "Rating updated successfully"
        });

    } catch (error) {
        console.error("Update rating error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

const deleteRating = async (req, res) => {
    try {
        const { store_id } = req.body;

        const user_id = req.user.id;

        // 1. Validate required field
        if (!store_id) {
            return res.status(400).json({
                message: "Store ID is required"
            });
        }

        // 2. Check whether rating exists
        const [existingRatings] = await db.query(
            "SELECT id FROM ratings WHERE user_id = ? AND store_id = ?",
            [user_id, store_id]
        );

        if (existingRatings.length === 0) {
            return res.status(404).json({
                message: "Rating not found"
            });
        }

        // 3. Delete rating
        await db.query(
            "DELETE FROM ratings WHERE user_id = ? AND store_id = ?",
            [user_id, store_id]
        );

        // 4. Send success response
        res.status(200).json({
            message: "Rating deleted successfully"
        });

    } catch (error) {
        console.error("Delete rating error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createRating,
    getStoreRatings,
    updateRating,
    deleteRating
};