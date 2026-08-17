import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Star, MapPin, Mail, ArrowLeft, Trash2 } from 'lucide-react';

const StoreDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Rating state
    const [hoverRating, setHoverRating] = useState(0);
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const fetchStore = async () => {
        try {
            const response = await api.get(`/stores/${id}`);
            setStore(response.data.store);
            if (response.data.store.myRating) {
                setRating(response.data.store.myRating);
            }
        } catch (err) {
            setError("Failed to fetch store details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStore();
    }, [id]);

    const handleRatingSubmit = async (selectedRating) => {
        setSubmitting(true);
        try {
            if (store.myRating) {
                // Update existing
                await api.put('/ratings', { store_id: store.id, rating: selectedRating });
            } else {
                // Create new
                await api.post('/ratings', { store_id: store.id, rating: selectedRating });
            }
            // Refresh to get updated averages
            fetchStore();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit rating");
            setRating(store.myRating || 0); // revert
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRating = async () => {
        if (!window.confirm("Are you sure you want to remove your rating?")) return;
        setSubmitting(true);
        try {
            await api.delete('/ratings', { data: { store_id: store.id } });
            setRating(0);
            fetchStore();
        } catch (err) {
            alert("Failed to delete rating");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error || !store) return <div className="text-red-500">{error || "Store not found"}</div>;

    return (
        <div className="max-w-4xl mx-auto mt-4">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-primary-color mb-6 transition">
                <ArrowLeft size={16} /> Back to Stores
            </button>

            <div className="glass-card flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2">{store.name}</h1>
                    <div className="text-gray-600 flex flex-col gap-2 mb-6">
                        <span className="flex items-center gap-2"><MapPin size={18} /> {store.address}</span>
                        <span className="flex items-center gap-2"><Mail size={18} /> {store.email}</span>
                    </div>

                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg inline-flex">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-500">Overall Rating</span>
                            <div className="flex items-center text-yellow-500 text-3xl font-bold gap-1 mt-1">
                                {store.averageRating} <Star size={28} fill="currentColor" />
                            </div>
                        </div>
                        <div className="border-l pl-4 flex flex-col justify-center">
                            <span className="text-2xl font-bold">{store.ratingCount}</span>
                            <span className="text-sm text-gray-500">Total Reviews</span>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/3 bg-white p-6 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-semibold mb-4">
                        {store.myRating ? "Update your rating" : "Rate this store"}
                    </h3>
                    
                    <div className="star-rating mb-2" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                                key={star} 
                                size={40}
                                fill={(hoverRating || rating) >= star ? "#ffb703" : "none"}
                                className={`star ${(hoverRating || rating) >= star ? '' : 'inactive'}`}
                                onMouseEnter={() => setHoverRating(star)}
                                onClick={() => {
                                    setRating(star);
                                    handleRatingSubmit(star);
                                }}
                                style={{ pointerEvents: submitting ? 'none' : 'auto', opacity: submitting ? 0.5 : 1 }}
                            />
                        ))}
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4 h-5">
                        {rating > 0 ? `You rated ${rating} out of 5` : hoverRating > 0 ? `Click to rate ${hoverRating}` : "Select stars to rate"}
                    </p>

                    {store.myRating > 0 && (
                        <button 
                            onClick={handleDeleteRating}
                            disabled={submitting}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition"
                        >
                            <Trash2 size={14} /> Remove my rating
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreDetails;
