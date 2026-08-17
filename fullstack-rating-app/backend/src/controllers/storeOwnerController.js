const db = require("../config/db");

const getDashboardData = async (req, res) => {
    try {
        const owner_id = req.user.id;

        // Fetch store details
        const [stores] = await db.execute(
            "SELECT id, name, email, address FROM stores WHERE owner_id = ?",
            [owner_id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                message: "No store found for this owner"
            });
        }

        const store = stores[0];

        let { sortBy = "id", sortOrder = "DESC" } = req.query;
        const allowedSortCols = ['id', 'user_name', 'rating'];
        const orderDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        let orderCol = 'r.id';
        if (sortBy === 'user_name') orderCol = 'u.name';
        else if (sortBy === 'rating') orderCol = 'r.rating';

        // Fetch ratings for the store
        const [ratings] = await db.execute(
            `SELECT r.id, r.user_id, u.name as user_name, r.rating
             FROM ratings r
             JOIN users u ON r.user_id = u.id
             WHERE r.store_id = ?
             ORDER BY ${orderCol} ${orderDir}`,
            [store.id]
        );

        // Calculate statistics
        const totalRatings = ratings.length;
        let averageRating = 0;
        
        if (totalRatings > 0) {
            const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = (sum / totalRatings).toFixed(1);
        }

        return res.status(200).json({
            message: "Store owner dashboard fetched successfully",
            store: store,
            statistics: {
                averageRating: parseFloat(averageRating),
                totalRatings: totalRatings
            },
            ratings: ratings
        });

    } catch (error) {
        console.error("Error in getStoreOwnerDashboard:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getDashboardData
};
