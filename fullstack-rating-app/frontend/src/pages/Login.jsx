import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.token);
            
            // Redirect based on role
            const role = response.data.user.role;
            if (role === 'ADMIN') navigate('/admin/dashboard');
            else if (role === 'STORE_OWNER') navigate('/owner/dashboard');
            else navigate('/dashboard');
            
        } catch (err) {
            console.error("Login Error:", err);
            const msg = err.response?.data?.message || err.message || 'Login failed';
            setError(msg);
            alert("Error: " + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-full mt-10">
            <div className="glass-card w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Welcome Back</h2>
                    <p className="text-secondary">Login to your account</p>
                </div>
                
                {error && <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-2" disabled={loading}>
                        <LogIn size={18} /> {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <div className="mt-6 text-center text-sm text-secondary">
                    Don't have an account? <Link to="/register" className="text-primary font-medium">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
