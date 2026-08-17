import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="error-page">
            <FileQuestion size={80} color="var(--primary-color)" className="mb-4" />
            <h1 className="error-code" style={{color: 'var(--primary-color)'}}>404</h1>
            <h2 className="mb-2">Resource Not Found</h2>
            <p className="mb-4 text-secondary">The page or resource you are looking for does not exist.</p>
            <Link to="/" className="btn btn-primary">
                Return to Home
            </Link>
        </div>
    );
};

export default NotFound;
