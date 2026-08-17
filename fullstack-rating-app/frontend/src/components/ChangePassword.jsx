import React, { useState } from 'react';
import api from '../services/api';

const ChangePassword = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const validatePassword = (password) => {
        if (!password || password.length < 8 || password.length > 16) {
            return "Password must be between 8 and 16 characters.";
        }
        const uppercaseRegex = /[A-Z]/;
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        
        if (!uppercaseRegex.test(password)) {
            return "Password must include at least one uppercase letter.";
        }
        if (!specialCharRegex.test(password)) {
            return "Password must include at least one special character.";
        }
        return null;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        const passwordError = validatePassword(formData.newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setSuccess("Password updated successfully");
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-6 max-w-md mx-auto mt-8">
            <h3 className="text-xl font-bold mb-4">Change Password</h3>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Current Password</label>
                    <input 
                        type="password" 
                        name="currentPassword" 
                        className="form-control" 
                        value={formData.currentPassword}
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">New Password</label>
                    <input 
                        type="password" 
                        name="newPassword" 
                        className="form-control" 
                        value={formData.newPassword}
                        onChange={handleChange} 
                        required 
                    />
                    <small className="text-gray-500">8-16 characters, 1 uppercase, 1 special character</small>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Confirm New Password</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        className="form-control" 
                        value={formData.confirmPassword}
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
