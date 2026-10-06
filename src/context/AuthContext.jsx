import React, { createContext, useState, useEffect } from 'react';
import API from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('saree_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            API.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
        setLoading(false);
    }, []);

    /** Exchange phone + OTP for our app user + JWT */
    const loginWithOTP = async (phone, otp) => {
        const { data } = await API.post('/api/users/verify-otp', { phone, otp });
        setUser(data);
        localStorage.setItem('saree_user', JSON.stringify(data));
        API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    /** Exchange Firebase ID token (after phone OTP) for our app user + JWT */
    const loginWithFirebaseToken = async (idToken) => {
        const { data } = await API.post('/api/users/firebase-phone-auth', { idToken });
        setUser(data);
        localStorage.setItem('saree_user', JSON.stringify(data));
        API.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('saree_user');
        delete API.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithOTP, loginWithFirebaseToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
