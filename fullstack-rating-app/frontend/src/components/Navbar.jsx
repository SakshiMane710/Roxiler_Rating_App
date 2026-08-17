import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Star, UserCircle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <Star size={24} />
                Roxiler Ratings
            </Link>
            
            <div className="nav-links">
                {user && user.role === 'ADMIN' && (
                    <>
                        <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                        <Link to="/admin/users" className="nav-link">Users</Link>
                        <Link to="/admin/stores" className="nav-link">Stores</Link>
                        <Link to="/admin/ratings" className="nav-link">Ratings</Link>
                    </>
                )}
                {user && user.role === 'STORE_OWNER' && (
                    <Link to="/owner/dashboard" className="nav-link">My Store</Link>
                )}
                {user && user.role === 'USER' && (
                    <Link to="/dashboard" className="nav-link">Explore Stores</Link>
                )}
                
                {user ? (
                    <div className="nav-user ml-4 border-l pl-4">
                        <span className="flex items-center gap-2 text-sm text-gray-600">
                            <UserCircle size={18} />
                            {user.name || user.email}
                        </span>
                        <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2 py-1 px-3 text-sm">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn btn-primary py-1 px-4 text-sm">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
