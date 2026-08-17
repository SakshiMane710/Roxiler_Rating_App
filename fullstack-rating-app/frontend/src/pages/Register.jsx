import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', address: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const validateForm = () => {
        if (formData.name.length < 20 || formData.name.length > 60) return "Name must be between 20 and 60 characters.";
        if (formData.address.length > 400) return "Address must be maximum 400 characters.";
        if (formData.password.length < 8 || formData.password.length > 16) return "Password must be between 8 and 16 characters.";
        if (!/[A-Z]/.test(formData.password)) return "Password must include at least one uppercase letter.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) return "Password must include at least one special character.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) return "Please enter a valid email address.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const formError = validateForm();
        if (formError) {
            setError(formError);
            return;
        }

        setLoading(true);
        
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            console.error("Register Error:", err);
            const msg = err.response?.data?.message || err.message || 'Registration failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-full mt-10">
            <div className="glass-card w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Create an Account</h2>
                    <p className="text-secondary">Join Roxiler Ratings</p>
                </div>
                
                {error && <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Name</label>
                        <input type="text" name="name" className="form-control" onChange={handleChange} required minLength={20} maxLength={60} />
                        <small className="text-gray-500 text-xs">20-60 characters</small>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" className="form-control" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" onChange={handleChange} required minLength={8} maxLength={16} />
                        <small className="text-gray-500 text-xs">8-16 chars, 1 uppercase, 1 special char</small>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input type="text" name="address" className="form-control" onChange={handleChange} required maxLength={400} />
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                
                <div className="mt-6 text-center text-sm text-secondary">
                    Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
