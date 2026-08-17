import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, Star, ChevronUp, ChevronDown } from 'lucide-react';

const AdminRatings = () => {
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStore, setFilterStore] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('DESC');

    const fetchRatings = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ page, limit: 10, sortBy, sortOrder });
            if (filterStore) query.append('store_id', filterStore);
            if (filterUser) query.append('user_id', filterUser);
            
            const response = await api.get(`/admin/ratings?${query.toString()}`);
            setRatings(response.data.ratings);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error("Failed to fetch ratings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchRatings();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [page, filterStore, filterUser, sortBy, sortOrder]);

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

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this rating?")) {
            try {
                await api.delete(`/admin/ratings/${id}`);
                fetchRatings();
            } catch (err) {
                alert("Failed to delete rating");
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Platform Ratings</h2>
            </div>

            <div className="glass-card mb-6 flex gap-4">
                <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Filter by Store ID</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Store ID" 
                        value={filterStore}
                        onChange={(e) => { setFilterStore(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-600 mb-1 block">Filter by User ID</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        placeholder="User ID" 
                        value={filterUser}
                        onChange={(e) => { setFilterUser(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>ID <SortIcon field="id" /></th>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('store_name')}>Store <SortIcon field="store_name" /></th>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('user_name')}>User <SortIcon field="user_name" /></th>
                            <th className="cursor-pointer hover:bg-gray-100" onClick={() => handleSort('rating')}>Rating <SortIcon field="rating" /></th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                        ) : ratings.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">No ratings found.</td></tr>
                        ) : (
                            ratings.map(rating => (
                                <tr key={rating.id}>
                                    <td>{rating.id}</td>
                                    <td>
                                        <div className="font-medium">{rating.store_name}</div>
                                        <div className="text-xs text-gray-500">ID: {rating.store_id}</div>
                                    </td>
                                    <td>
                                        <div className="font-medium">{rating.user_name}</div>
                                        <div className="text-xs text-gray-500">{rating.user_email}</div>
                                    </td>
                                    <td>
                                        <div className="flex items-center text-yellow-500">
                                            <span className="font-bold text-gray-800 mr-1">{rating.rating}</span>
                                            <Star size={16} fill="currentColor" />
                                        </div>
                                    </td>
                                    <td>
                                        <button onClick={() => handleDelete(rating.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
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
        </div>
    );
};

export default AdminRatings;
