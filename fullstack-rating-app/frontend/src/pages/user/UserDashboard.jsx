import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, Star, MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import ChangePassword from '../../components/ChangePassword';

const UserDashboard = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('averageRating');
    const [sortOrder, setSortOrder] = useState('DESC');

    const fetchStores = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({ page, limit: 12, search, sortBy, sortOrder }).toString();
            const response = await api.get(`/stores?${query}`);
            setStores(response.data.stores);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err) {
            console.error("Failed to fetch stores");
        } finally {
            setLoading(false);
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
        setPage(1);
    };

    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <span className="opacity-30 inline-block w-4">&#8597;</span>;
        return sortOrder === 'ASC' ? <ChevronUp size={16} className="inline" /> : <ChevronDown size={16} className="inline" />;
    };

    return (
        <div>
            <div className="text-center mb-10 mt-6">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Discover Great Stores</h1>
                <p className="text-xl text-gray-500">Find, review, and rate your favorite local businesses.</p>
            </div>

            <div className="max-w-3xl mx-auto relative mb-10">
                <Search className="absolute left-4 top-4 text-gray-400" size={24} />
                <input 
                    type="text" 
                    className="w-full p-4 pl-12 text-lg rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-color transition" 
                    placeholder="Search for stores or addresses..." 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>
            
            <div className="flex justify-end gap-4 mb-4">
                <span className="font-semibold text-gray-700">Sort By:</span>
                <button className={`hover:text-primary-color ${sortBy === 'name' ? 'text-primary-color font-bold' : ''}`} onClick={() => handleSort('name')}>
                    Name <SortIcon field="name" />
                </button>
                <button className={`hover:text-primary-color ${sortBy === 'averageRating' ? 'text-primary-color font-bold' : ''}`} onClick={() => handleSort('averageRating')}>
                    Rating <SortIcon field="averageRating" />
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading stores...</div>
            ) : stores.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No stores found matching your search.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.map(store => (
                        <div key={store.id} className="glass-card flex flex-col h-full transition hover:-translate-y-2">
                            <h3 className="text-xl font-bold mb-2">{store.name}</h3>
                            <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                                <MapPin size={14} /> {store.address}
                            </p>
                            
                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                                <div className="flex flex-col">
                                    <div className="flex items-center text-yellow-500 font-bold gap-1">
                                        {store.averageRating} <Star size={16} fill="currentColor" />
                                    </div>
                                    <div className="text-xs text-gray-400">{store.ratingCount} reviews</div>
                                </div>
                                
                                <div className="flex flex-col items-end">
                                    {store.myRating ? (
                                        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mb-1 font-semibold">
                                            You rated: {store.myRating} ★
                                        </div>
                                    ) : null}
                                    <Link to={`/store/${store.id}`} className="text-primary-color font-semibold hover:underline text-sm">
                                        View Details &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
            
            <div className="mt-16 border-t pt-8">
                <ChangePassword />
            </div>
        </div>
    );
};

export default UserDashboard;
