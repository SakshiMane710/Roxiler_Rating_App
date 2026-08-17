const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { validateName, validateAddress, validatePassword, validateEmail } = require("../utils/validators");

const getDashboardData = async (req, res) => {
    try {
        const [usersResult] = await db.execute("SELECT COUNT(*) as count FROM users");
        const [storesResult] = await db.execute("SELECT COUNT(*) as count FROM stores");
        const [ratingsResult] = await db.execute("SELECT COUNT(*) as count FROM ratings");

        const totalUsers = usersResult[0].count;
        const totalStores = storesResult[0].count;
        const totalRatings = ratingsResult[0].count;

        return res.status(200).json({
            message: "Admin dashboard data fetched successfully",
            statistics: {
                totalUsers,
                totalStores,
                totalRatings
            }
        });
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "", role = "", sortBy = "id", sortOrder = "DESC" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const allowedSortCols = ['id', 'name', 'email', 'address', 'role'];
        const orderDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        const orderCol = allowedSortCols.includes(sortBy) ? sortBy : 'id';

        let queryParams = [];
        let whereClause = "WHERE 1=1";

        if (search) {
            whereClause += " AND (name LIKE ? OR email LIKE ?)";
            queryParams.push(`%${search}%`, `%${search}%`);
        }
        
        if (role) {
            whereClause += " AND role = ?";
            queryParams.push(role);
        }

        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const [countResult] = await db.query(countQuery, queryParams);
        const total = countResult[0].total;

        const dataQuery = `
            SELECT 
                u.id, u.name, u.email, u.address, u.role,
                (SELECT COALESCE(AVG(r.rating), 0) FROM stores s JOIN ratings r ON s.id = r.store_id WHERE s.owner_id = u.id) as owner_rating
            FROM users u 
            ${whereClause} 
            ORDER BY ${orderCol} ${orderDir} 
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limit, offset);
        const [users] = await db.query(dataQuery, queryParams);
        
        const formattedUsers = users.map(u => ({
            ...u,
            owner_rating: u.owner_rating ? parseFloat(u.owner_rating).toFixed(1) : null
        }));

        return res.status(200).json({
            users: formattedUsers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error in getAllUsers:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await db.execute("SELECT id, name, email, address, role FROM users WHERE id = ?", [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        
        return res.status(200).json({ user: users[0] });
    } catch (error) {
        console.error("Error in getUserById:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;
        
        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        
        const nameError = validateName(name);
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
        const addressError = validateAddress(address);

        if (nameError || emailError || passwordError || addressError) {
            return res.status(400).json({
                message: nameError || emailError || passwordError || addressError
            });
        }
        
        const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Email already in use" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const [result] = await db.execute(
            "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)",
            [name, email, hashedPassword, address, role]
        );
        
        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: result.insertId,
                name,
                email,
                address,
                role
            }
        });
    } catch (error) {
        console.error("Error in createUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, address, role, password } = req.body;
        
        const [users] = await db.execute("SELECT id FROM users WHERE id = ?", [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (name) {
            const err = validateName(name);
            if (err) return res.status(400).json({ message: err });
        }
        if (address) {
            const err = validateAddress(address);
            if (err) return res.status(400).json({ message: err });
        }
        if (password) {
            const err = validatePassword(password);
            if (err) return res.status(400).json({ message: err });
        }
        
        if (email) {
            const err = validateEmail(email);
            if (err) return res.status(400).json({ message: err });
            const [existing] = await db.execute("SELECT id FROM users WHERE email = ? AND id != ?", [email, id]);
            if (existing.length > 0) {
                return res.status(409).json({ message: "Email already in use" });
            }
        }
        
        if (role) {
            const validRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }
        }
        
        let updates = [];
        let params = [];
        
        if (name) { updates.push("name = ?"); params.push(name); }
        if (email) { updates.push("email = ?"); params.push(email); }
        if (address) { updates.push("address = ?"); params.push(address); }
        if (role) { updates.push("role = ?"); params.push(role); }
        
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updates.push("password = ?");
            params.push(hashedPassword);
        }
        
        if (updates.length > 0) {
            params.push(id);
            await db.execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
        }
        
        const [updatedUsers] = await db.execute("SELECT id, name, email, address, role FROM users WHERE id = ?", [id]);
        
        return res.status(200).json({
            message: "User updated successfully",
            user: updatedUsers[0]
        });
    } catch (error) {
        console.error("Error in updateUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [users] = await db.execute("SELECT id FROM users WHERE id = ?", [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Handle related ratings first to avoid foreign key constraints
        await db.execute("DELETE FROM ratings WHERE user_id = ?", [id]);
        
        // Also handling related stores in case the user is a STORE_OWNER
        await db.execute("DELETE FROM stores WHERE owner_id = ?", [id]);
        
        // Now delete the user
        await db.execute("DELETE FROM users WHERE id = ?", [id]);
        
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAllStores = async (req, res) => {
    try {
        let { page = 1, limit = 10, search = "", sortBy = "id", sortOrder = "DESC" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const allowedSortCols = ['id', 'name', 'email', 'address', 'owner_name'];
        const orderDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        let orderCol = 's.id';
        if (sortBy === 'name') orderCol = 's.name';
        else if (sortBy === 'email') orderCol = 's.email';
        else if (sortBy === 'address') orderCol = 's.address';
        else if (sortBy === 'owner_name') orderCol = 'u.name';

        let queryParams = [];
        let whereClause = "WHERE 1=1";

        if (search) {
            whereClause += " AND (s.name LIKE ? OR s.email LIKE ? OR s.address LIKE ?)";
            queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const countQuery = `SELECT COUNT(*) as total FROM stores s ${whereClause}`;
        const [countResult] = await db.query(countQuery, queryParams);
        const total = countResult[0].total;

        const dataQuery = `
            SELECT s.id, s.name, s.email, s.address, s.owner_id, 
                   u.name as owner_name, u.email as owner_email,
                   COALESCE(AVG(r.rating), 0) as averageRating
            FROM stores s 
            LEFT JOIN users u ON s.owner_id = u.id 
            LEFT JOIN ratings r ON s.id = r.store_id
            ${whereClause} 
            GROUP BY s.id
            ORDER BY ${orderCol} ${orderDir}
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limit, offset);
        const [stores] = await db.query(dataQuery, queryParams);

        const formattedStores = stores.map(store => ({
            ...store,
            averageRating: parseFloat(store.averageRating).toFixed(1)
        }));

        return res.status(200).json({
            stores: formattedStores,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error in getAllStores:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT s.id, s.name, s.email, s.address, s.owner_id,
                   u.name as owner_name, u.email as owner_email
            FROM stores s
            LEFT JOIN users u ON s.owner_id = u.id
            WHERE s.id = ?
        `;
        const [stores] = await db.execute(query, [id]);
        
        if (stores.length === 0) {
            return res.status(404).json({ message: "Store not found" });
        }
        
        return res.status(200).json({ store: stores[0] });
    } catch (error) {
        console.error("Error in getStoreById:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const createStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;
        
        if (!name || !email || !address || !owner_id) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        const nameError = validateName(name);
        const emailError = validateEmail(email);
        const addressError = validateAddress(address);

        if (nameError || emailError || addressError) {
            return res.status(400).json({
                message: nameError || emailError || addressError
            });
        }
        
        const [users] = await db.execute("SELECT id, role FROM users WHERE id = ?", [owner_id]);
        if (users.length === 0) {
            return res.status(404).json({ message: "Owner not found" });
        }
        if (users[0].role !== 'STORE_OWNER') {
            return res.status(400).json({ message: "User is not a STORE_OWNER" });
        }
        
        const [existing] = await db.execute("SELECT id FROM stores WHERE email = ?", [email]);
        if (existing.length > 0) {
            return res.status(409).json({ message: "Store email already in use" });
        }
        
        const [result] = await db.execute(
            "INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)",
            [name, email, address, owner_id]
        );
        
        return res.status(201).json({
            message: "Store created successfully",
            store: {
                id: result.insertId,
                name,
                email,
                address,
                owner_id
            }
        });
    } catch (error) {
        console.error("Error in createStore:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, address, owner_id } = req.body;
        
        const [stores] = await db.execute("SELECT id FROM stores WHERE id = ?", [id]);
        if (stores.length === 0) {
            return res.status(404).json({ message: "Store not found" });
        }
        
        if (name) {
            const err = validateName(name);
            if (err) return res.status(400).json({ message: err });
        }
        if (address) {
            const err = validateAddress(address);
            if (err) return res.status(400).json({ message: err });
        }
        
        if (email) {
            const err = validateEmail(email);
            if (err) return res.status(400).json({ message: err });
            const [existing] = await db.execute("SELECT id FROM stores WHERE email = ? AND id != ?", [email, id]);
            if (existing.length > 0) {
                return res.status(409).json({ message: "Store email already in use" });
            }
        }
        
        if (owner_id) {
            const [users] = await db.execute("SELECT id, role FROM users WHERE id = ?", [owner_id]);
            if (users.length === 0) {
                return res.status(404).json({ message: "Owner not found" });
            }
            if (users[0].role !== 'STORE_OWNER') {
                return res.status(400).json({ message: "User is not a STORE_OWNER" });
            }
        }
        
        let updates = [];
        let params = [];
        
        if (name) { updates.push("name = ?"); params.push(name); }
        if (email) { updates.push("email = ?"); params.push(email); }
        if (address) { updates.push("address = ?"); params.push(address); }
        if (owner_id) { updates.push("owner_id = ?"); params.push(owner_id); }
        
        if (updates.length > 0) {
            params.push(id);
            await db.execute(`UPDATE stores SET ${updates.join(", ")} WHERE id = ?`, params);
        }
        
        const [updatedStores] = await db.execute("SELECT * FROM stores WHERE id = ?", [id]);
        
        return res.status(200).json({
            message: "Store updated successfully",
            store: updatedStores[0]
        });
    } catch (error) {
        console.error("Error in updateStore:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [stores] = await db.execute("SELECT id FROM stores WHERE id = ?", [id]);
        if (stores.length === 0) {
            return res.status(404).json({ message: "Store not found" });
        }
        
        await db.execute("DELETE FROM ratings WHERE store_id = ?", [id]);
        await db.execute("DELETE FROM stores WHERE id = ?", [id]);
        
        return res.status(200).json({ message: "Store deleted successfully" });
    } catch (error) {
        console.error("Error in deleteStore:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAllRatings = async (req, res) => {
    try {
        let { page = 1, limit = 10, store_id = "", user_id = "", rating = "", sortBy = "rating_id", sortOrder = "DESC" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const allowedSortCols = ['rating_id', 'user_name', 'store_name', 'rating'];
        const orderDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        let orderCol = 'r.id';
        if (sortBy === 'user_name') orderCol = 'u.name';
        else if (sortBy === 'store_name') orderCol = 's.name';
        else if (sortBy === 'rating') orderCol = 'r.rating';

        let queryParams = [];
        let whereClause = "WHERE 1=1";

        if (store_id) {
            whereClause += " AND r.store_id = ?";
            queryParams.push(store_id);
        }
        if (user_id) {
            whereClause += " AND r.user_id = ?";
            queryParams.push(user_id);
        }
        if (rating) {
            whereClause += " AND r.rating = ?";
            queryParams.push(rating);
        }

        const countQuery = `SELECT COUNT(*) as total FROM ratings r ${whereClause}`;
        const [countResult] = await db.query(countQuery, queryParams);
        const total = countResult[0].total;

        const dataQuery = `
            SELECT r.id as rating_id, r.user_id, u.name as user_name, u.email as user_email,
                   r.store_id, s.name as store_name, r.rating
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            JOIN stores s ON r.store_id = s.id
            ${whereClause}
            ORDER BY ${orderCol} ${orderDir}
            LIMIT ? OFFSET ?
        `;
        queryParams.push(limit, offset);
        const [ratings] = await db.query(dataQuery, queryParams);

        return res.status(200).json({
            ratings,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error in getAllRatings:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteAdminRating = async (req, res) => {
    try {
        const { id } = req.params;

        const [ratings] = await db.execute("SELECT id FROM ratings WHERE id = ?", [id]);
        if (ratings.length === 0) {
            return res.status(404).json({ message: "Rating not found" });
        }

        await db.execute("DELETE FROM ratings WHERE id = ?", [id]);

        return res.status(200).json({ message: "Rating deleted successfully" });
    } catch (error) {
        console.error("Error in deleteAdminRating:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
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
};