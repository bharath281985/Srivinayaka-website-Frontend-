import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-4xl font-serif text-gray-900 mb-3">Page Not Found</h1>
            <p className="text-gray-600 mb-6">The page you requested does not exist.</p>
            <Link to="/" className="bg-amber-900 text-white px-6 py-3 rounded">Back to Home</Link>
        </div>
    );
};

export default NotFound;
