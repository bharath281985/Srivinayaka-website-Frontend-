import React, { createContext, useState, useEffect } from 'react';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            setWishlistItems(JSON.parse(savedWishlist));
        }
    }, []);

    const toggleWishlist = (product) => {
        const isExist = wishlistItems.find(item => item._id === product._id);
        let updated;
        if (isExist) {
            updated = wishlistItems.filter(item => item._id !== product._id);
        } else {
            updated = [...wishlistItems, product];
        }
        setWishlistItems(updated);
        localStorage.setItem('wishlist', JSON.stringify(updated));
    };

    const isInWishlist = (id) => {
        return !!wishlistItems.find(item => item._id === id);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            toggleWishlist,
            isInWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
