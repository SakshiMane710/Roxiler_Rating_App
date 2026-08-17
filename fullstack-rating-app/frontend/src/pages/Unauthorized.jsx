import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
    return (
        <div className="error-page">
            <ShieldAlert size={80} color="var(--danger-color)" className="mb-4" />
            <h1 className="error-code">403</h1>
            <h2 className="mb-2">Access Denied</h2>
            <p className="mb-4 text-secondary">You do not have permission to view this page.</p>
            <Link to="/" className="btn btn-primary">
                Return to Home
            </Link>
        </div>
    );
};

export default Unauthorized;
