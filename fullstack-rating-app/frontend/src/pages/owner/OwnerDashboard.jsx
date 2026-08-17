import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Star, ChevronUp, ChevronDown } from 'lucide-react';
import ChangePassword from '../../components/ChangePassword';

const OwnerDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [sortOrder, setSortOrder] = useState('DESC');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const query = new URLSearchParams({ sortBy, sortOrder }).toString();
                const response = await api.get(`/store-owner/dashboard?${query}`);
                setData(response.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setError("You don't have a store assigned to you yet.");
                } else {
                    setError('Failed to fetch store dashboard.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [sortBy, sortOrder]);

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
        return sortOrder === 'ASC' ? <ChevronUp size={16} className="inline" /> : <ChevronDown size={16} className="inline" />;
    };

    if (loading) return <div>Loading your store...</div>;
    if (error) return (
        <div className="error-page">
            <h2 className="text-2xl font-bold mb-4">No Store Found</h2>
            <p className="text-gray-600">{error}</p>
        </div>
    );

    const { store, statistics, ratings } = data;

    return (
        <div>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-primary">{store.name}</h2>
                    <p className="text-gray-500 mt-1">{store.address} | {store.email}</p>
                </div>
                <div className="glass-card flex gap-6 px-8 py-4">
                    <div className="text-center">
                        <div className="text-sm text-gray-500 font-semibold mb-1">Average Rating</div>
                        <div className="text-3xl font-bold text-yellow-500 flex items-center justify-center gap-1">
                            {statistics.averageRating} <Star size={24} fill="currentColor" />
                        </div>
                    </div>
                    <div className="border-l pl-6 text-center">
                        <div className="text-sm text-gray-500 font-semibold mb-1">Total Ratings</div>
                        <div className="text-3xl font-bold">{statistics.totalRatings}</div>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold">Customer Reviews</h3>
                    <div className="flex gap-4">
                        <span className="text-sm font-semibold text-gray-500">Sort By:</span>
                        <button className={`text-sm hover:text-primary-color ${sortBy === 'user_name' ? 'text-primary-color font-bold' : ''}`} onClick={() => handleSort('user_name')}>
                            User <SortIcon field="user_name" />
                        </button>
                        <button className={`text-sm hover:text-primary-color ${sortBy === 'rating' ? 'text-primary-color font-bold' : ''}`} onClick={() => handleSort('rating')}>
                            Rating <SortIcon field="rating" />
                        </button>
                    </div>
                </div>
                
                {ratings.length === 0 ? (
                    <p className="text-gray-500 italic">No ratings yet.</p>
                ) : (
                    <div className="space-y-4">
                        {ratings.map(r => (
                            <div key={r.id} className="p-4 bg-gray-50 rounded-lg border flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-gray-800">{r.user_name}</h4>
                                    <div className="text-sm text-gray-500">User ID: {r.user_id}</div>
                                </div>
                                <div className="flex items-center text-yellow-500 gap-1 bg-white px-3 py-1 rounded shadow-sm">
                                    <span className="font-bold text-lg">{r.rating}</span>
                                    <Star size={18} fill="currentColor" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-16 border-t pt-8">
                <ChangePassword />
            </div>
        </div>
    );
};

export default OwnerDashboard;
