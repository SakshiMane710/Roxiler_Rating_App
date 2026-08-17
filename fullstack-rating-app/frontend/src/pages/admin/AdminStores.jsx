import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

const AdminStores = () => {
    const [stores, setStores] = useState([]);
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [formError, setFormError] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', email: '', address: '', owner_id: '' });

    const fetchStores = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ page, limit: 10, search, sortBy, sortOrder }).toString();
            const response = await api.get(`/admin/stores?${query}`);
            setStores(response.data.stores);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error("Failed to fetch stores");
        } finally {
            setLoading(false);
        }
    };

    const fetchOwners = async () => {
        try {
            const response = await api.get('/admin/users?role=STORE_OWNER&limit=100');
            setOwners(response.data.users);
        } catch (err) {
            console.error("Failed to fetch owners");
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchStores();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, page, sortBy, sortOrder]);

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
        if (formData.name.length < 20 || formData.name.length > 60) return "Store name must be between 20 and 60 characters.";
        if (formData.address.length > 400) return "Address must be maximum 400 characters.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) return "Please enter a valid email address.";
        return null;
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this store?")) {
            try {
                await api.delete(`/admin/stores/${id}`);
                fetchStores();
            } catch (err) {
                alert("Failed to delete store");
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
                await api.put(`/admin/stores/${formData.id}`, formData);
            } else {
                await api.post('/admin/stores', formData);
            }
            setShowModal(false);
            fetchStores();
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed");
        }
    };

    const openAddModal = () => {
        setIsEditing(false);
        setFormData({ id: null, name: '', email: '', address: '', owner_id: '' });
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (store) => {
        setIsEditing(true);
        setFormData({ id: store.id, name: store.name, email: store.email, address: store.address, owner_id: store.owner_id });
        setFormError('');
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Store Management</h2>
                <button onClick={openAddModal} className="btn btn-primary">
                    <Plus size={18} /> Add Store
                </button>
            </div>

            <div className="glass-card mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        className="form-control pl-10" 
                        placeholder="Search by store name, email or address..." 
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>ID <SortIcon field="id" /></th>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>Store Name <SortIcon field="name" /></th>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('email')}>Email <SortIcon field="email" /></th>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('address')}>Address <SortIcon field="address" /></th>
                            <th>Rating</th>
                            <th>Owner</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                        ) : stores.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-4">No stores found.</td></tr>
                        ) : (
                            stores.map(store => (
                                <tr key={store.id}>
                                    <td>{store.id}</td>
                                    <td className="font-medium">{store.name}</td>
                                    <td>{store.email}</td>
                                    <td>{store.address}</td>
                                    <td>
                                        <div className="flex items-center text-yellow-500 font-bold">
                                            {store.averageRating}
                                            <span className="text-lg leading-none ml-1">★</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            <div>{store.owner_name}</div>
                                            <div className="text-gray-500">{store.owner_email}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button onClick={() => openEditModal(store)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(store.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
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
                            <h3 className="text-xl font-bold">{isEditing ? 'Edit Store' : 'Add New Store'}</h3>
                            <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            {formError && <div className="p-2 mb-4 text-sm text-red-800 bg-red-100 rounded">{formError}</div>}
                            <div className="form-group">
                                <label className="form-label">Store Name</label>
                                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required minLength={20} maxLength={60} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Store Email</label>
                                <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input type="text" className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required maxLength={400} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Assign Owner</label>
                                <select className="form-control" value={formData.owner_id} onChange={e => setFormData({...formData, owner_id: e.target.value})} required>
                                    <option value="">Select an Owner...</option>
                                    {owners.map(owner => (
                                        <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary">{isEditing ? 'Save Changes' : 'Create Store'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStores;
