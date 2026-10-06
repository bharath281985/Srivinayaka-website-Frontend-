import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const storedCart = localStorage.getItem('omnimart_cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });

    const isSameItem = (item, productId, variant = null) =>
        item.product === productId && JSON.stringify(item.variant || null) === JSON.stringify(variant || null);

    // Persist cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('omnimart_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, qty = 1, addOns = { hasFallPico: false, hasUnderskirt: false, variant: null, originalMrp: null }) => {
        const existItem = cartItems.find((x) => isSameItem(x, product._id, addOns.variant));

        const fallPrice = addOns.hasFallPico ? 300 : 0;
        const skirtPrice = addOns.hasUnderskirt ? 800 : 0;
        const variantSalePrice = Number(addOns.variant?.basePrice || 0);
        const variantMrpPrice = Number(addOns.variant?.mrpPrice || 0);
        const finalItemPrice = addOns.finalPrice || (variantSalePrice || (product.basePrice + fallPrice + skirtPrice));
        const itemMrp = Number(addOns.originalMrp || (variantMrpPrice > finalItemPrice
            ? variantMrpPrice
            : (typeof product.discountPrice === 'number' && product.discountPrice > finalItemPrice
            ? product.discountPrice
            : finalItemPrice)));

        const cartData = {
            name: product.name,
            qty,
            image: addOns.variant?.imageUrl || product.images[0],
            price: finalItemPrice,
            product: product._id,
            fabric: product.fabric,
            hasFallPico: addOns.hasFallPico,
            hasUnderskirt: addOns.hasUnderskirt,
            originalBasePrice: product.basePrice,
            originalMrp: itemMrp,
            variant: addOns.variant,
        };

        if (existItem) {
            setCartItems(
                cartItems.map((x) =>
                    isSameItem(x, existItem.product, existItem.variant) ? { ...cartData, qty: x.qty + qty } : x
                )
            );
        } else {
            setCartItems([...cartItems, cartData]);
        }
    };

    const updateCartQty = (productId, variant = null, nextQty) => {
        if (nextQty <= 0) {
            removeFromCart(productId, variant);
            return;
        }

        setCartItems(
            cartItems.map((item) =>
                isSameItem(item, productId, variant)
                    ? { ...item, qty: nextQty }
                    : item
            )
        );
    };

    const removeFromCart = (id, variant = null) => {
        setCartItems(cartItems.filter((x) => !isSameItem(x, id, variant)));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, updateCartQty, removeFromCart, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};
