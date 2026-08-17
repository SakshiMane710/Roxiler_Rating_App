const db = require("../config/db");
const { validateName, validateAddress, validateEmail } = require("../utils/validators");

const getAllStores = async (req, res) => {
    try {
        const user_id = req.user.id;
        let { page = 1, limit = 10, search = "", sortBy = "id", sortOrder = "DESC" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const allowedSortCols = ['id', 'name', 'address', 'averageRating', 'myRating'];
        const orderDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        let orderCol = 's.id';
        if (sortBy === 'name') orderCol = 's.name';
        else if (sortBy === 'address') orderCol = 's.address';
        else if (sortBy === 'averageRating') orderCol = 'averageRating';
        else if (sortBy === 'myRating') orderCol = 'myRating';

        let queryParams = [];
        let whereClause = "WHERE 1=1";

        if (search) {
            whereClause += " AND (s.name LIKE ? OR s.address LIKE ?)";
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        const countQuery = `SELECT COUNT(*) as total FROM stores s ${whereClause}`;
        const [countResult] = await db.query(countQuery, queryParams);
        const total = countResult[0].total;

        const dataQuery = `
            SELECT 
                s.id, 
                s.name, 
                s.email, 
                s.address,
                COALESCE(AVG(r.rating), 0) as averageRating,
                COUNT(r.id) as ratingCount,
                (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id LIMIT 1) as myRating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            ${whereClause}
            GROUP BY s.id
            ORDER BY ${orderCol} ${orderDir}
            LIMIT ? OFFSET ?
        `;
        
        let dataParams = [user_id];
        if (search) {
            dataParams.push(`%${search}%`, `%${search}%`);
        }
        dataParams.push(limit, offset);

        const [stores] = await db.query(dataQuery, dataParams);

        const formattedStores = stores.map(store => ({
            ...store,
            averageRating: parseFloat(store.averageRating).toFixed(1),
            ratingCount: parseInt(store.ratingCount)
        }));

        res.status(200).json({
            stores: formattedStores,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Get stores error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const dataQuery = `
            SELECT 
                s.id, 
                s.name, 
                s.email, 
                s.address,
                COALESCE(AVG(r.rating), 0) as averageRating,
                COUNT(r.id) as ratingCount,
                (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id LIMIT 1) as myRating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE s.id = ?
            GROUP BY s.id
        `;

        const [stores] = await db.query(dataQuery, [user_id, id]);

        if (stores.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        const store = stores[0];
        store.averageRating = parseFloat(store.averageRating).toFixed(1);
        store.ratingCount = parseInt(store.ratingCount);

        res.status(200).json({
            store: store
        });

    } catch (error) {
        console.error("Get store error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const createStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        // 1. Validate required fields
        if (!name || !email || !address || !owner_id) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        
        const nameError = validateName(name);
        const emailError = validateEmail(email);
        const addressError = validateAddress(address);

        if (nameError || emailError || addressError) {
            return res.status(400).json({
                message: nameError || emailError || addressError
            });
        }

        // 2. Check whether store email already exists
        const [existingStores] = await db.query(
            "SELECT id FROM stores WHERE email = ?",
            [email]
        );

        if (existingStores.length > 0) {
            return res.status(409).json({
                message: "Store email already exists"
            });
        }

        // 3. Check whether owner exists
        const [owners] = await db.query(
            "SELECT id, role FROM users WHERE id = ?",
            [owner_id]
        );

        if (owners.length === 0) {
            return res.status(404).json({
                message: "Owner not found"
            });
        }

        // 4. Check whether owner has STORE_OWNER role
        if (owners[0].role !== "STORE_OWNER") {
            return res.status(400).json({
                message: "User must have STORE_OWNER role"
            });
        }

        // 5. Insert store
        const [result] = await db.query(
            `INSERT INTO stores (name, email, address, owner_id)
             VALUES (?, ?, ?, ?)`,
            [name, email, address, owner_id]
        );

        // 6. Send success response
        res.status(201).json({
            message: "Store created successfully",
            storeId: result.insertId
        });

    } catch (error) {
        console.error("Create store error:", error);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getAllStores,
    getStoreById,
    createStore
};