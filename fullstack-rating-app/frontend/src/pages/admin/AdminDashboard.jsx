import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, Store, Star } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setStats({
                    users: response.data.totalUsers,
                    stores: response.data.totalStores,
                    ratings: response.data.totalRatings
                });
            } catch (err) {
                setError('Failed to fetch dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
            
            <div className="dashboard-grid">
                <div className="stat-card glass-card">
                    <div className="stat-icon">
                        <Users size={30} />
                    </div>
                    <div className="stat-content">
                        <h3>Total Users</h3>
                        <p>{stats.users}</p>
                    </div>
                </div>
                
                <div className="stat-card glass-card">
                    <div className="stat-icon">
                        <Store size={30} />
                    </div>
                    <div className="stat-content">
                        <h3>Total Stores</h3>
                        <p>{stats.stores}</p>
                    </div>
                </div>
                
                <div className="stat-card glass-card">
                    <div className="stat-icon">
                        <Star size={30} />
                    </div>
                    <div className="stat-content">
                        <h3>Total Ratings</h3>
                        <p>{stats.ratings}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
