import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [formError, setFormError] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', email: '', password: '', address: '', role: 'USER' });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ page, limit: 10, search, role: roleFilter, sortBy, sortOrder }).toString();
            const response = await api.get(`/admin/users?${query}`);
            setUsers(response.data.users);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, roleFilter, page, sortBy, sortOrder]);

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortOrder('ASC');
        }
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <span className="opacity-30 inline-block w-4">&#8597;</span>;
        return sortOrder === 'ASC' ? <ChevronUp size={16} className="inline ml-1" /> : <ChevronDown size={16} className="inline ml-1" />;
    };

    const validateForm = () => {
        if (formData.name.length < 20 || formData.name.length > 60) return "Name must be between 20 and 60 characters.";
        if (formData.address.length > 400) return "Address must be maximum 400 characters.";
        if (!isEditing || formData.password) {
            if (formData.password.length < 8 || formData.password.length > 16) return "Password must be between 8 and 16 characters.";
            if (!/[A-Z]/.test(formData.password)) return "Password must include at least one uppercase letter.";
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) return "Password must include at least one special character.";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) return "Please enter a valid email address.";
        return null;
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchUsers();
            } catch (err) {
                alert("Failed to delete user");
            }
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        const err = validateForm();
        if (err) {
            setFormError(err);
            return;
        }
        try {
            if (isEditing) {
                // omit password if empty during edit (backend should handle this or we can omit it)
                const payload = { ...formData };
                if (!payload.password) delete payload.password;
                await api.put(`/admin/users/${formData.id}`, payload);
            } else {
                await api.post('/admin/users', formData);
            }
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed");
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ id: null, name: '', email: '', password: '', address: '', role: 'USER' });
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setIsEditing(true);
        setFormData({ id: user.id, name: user.name, email: user.email, password: '', address: user.address, role: user.role });
        setFormError('');
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Management</h2>
                <button onClick={openAddModal} className="btn btn-primary">
                    <Plus size={18} /> Add User
                </button>
            </div>

            <div className="glass-card mb-6 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        className="form-control pl-10" 
                        placeholder="Search by name or email..." 
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <select 
                    className="form-control w-48"
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="USER">User</option>
                </select>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>ID <SortIcon field="id" /></th>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>Name <SortIcon field="name" /></th>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('email')}>Email <SortIcon field="email" /></th>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('role')}>Role <SortIcon field="role" /></th>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('address')}>Address <SortIcon field="address" /></th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-4">No users found.</td></tr>
                        ) : (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td className="font-medium">{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'STORE_OWNER' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                        {user.role === 'STORE_OWNER' && user.owner_rating !== null && (
                                            <div className="flex items-center text-yellow-500 font-bold mt-1 text-xs">
                                                Store Rating: {user.owner_rating}
                                                <span className="text-sm leading-none ml-1">★</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>{user.address}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i} 
                            className={`page-item ${page === i + 1 ? 'active' : ''}`}
                            onClick={() => setPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="text-xl font-bold">{isEditing ? 'Edit User' : 'Add New User'}</h3>
                            <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            {formError && <div className="p-2 mb-4 text-sm text-red-800 bg-red-100 rounded">{formError}</div>}
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required minLength={20} maxLength={60} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{isEditing ? 'Password (leave blank to keep current)' : 'Password'}</label>
                                <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!isEditing} minLength={8} maxLength={16} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                    <option value="USER">User</option>
                                    <option value="STORE_OWNER">Store Owner</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input type="text" className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required maxLength={400} />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create User'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
