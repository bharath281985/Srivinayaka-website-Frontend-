import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Trash2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';

const CartPage = () => {
    const { cartItems, updateCartQty, removeFromCart, cartTotal } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    return (
        <div className="container mx-auto px-4 py-12 min-h-[600px]">
            <h1 className="text-3xl font-serif text-gray-900 mb-8 border-b border-gray-200 pb-4">Your Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-16">
                    <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={40} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-serif text-gray-700 mb-4">Your cart is empty.</h2>
                    <p className="text-gray-500 mb-8">Start shopping to add products here.</p>
                    <Link to="/products" className="bg-amber-900 hover:bg-amber-800 text-white font-bold py-3 px-8 rounded transition">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded shadow-sm">
                            <div className="hidden md:grid grid-cols-6 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500 uppercase">
                                <div className="col-span-3">Product details</div>
                                <div className="text-center">Quantity</div>
                                <div className="text-right col-span-2">Price</div>
                            </div>

                            {cartItems.map((item, index) => (
                                <div key={`${item.product}-${index}`} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border-b border-gray-200 items-center">
                                    <div className="col-span-3 flex gap-4">
                                        <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <Link to={`/product/${item.slug || item.product}`} className="font-medium text-gray-900 hover:text-amber-800 transition line-clamp-2">
                                                {item.name}
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-1 uppercase">{item.fabric}</p>

                                            {(item.hasFallPico || item.hasUnderskirt) && (
                                                <div className="mt-2 text-xs border-l-2 border-amber-500 pl-2 text-gray-600 bg-amber-50 py-1">
                                                    {item.hasFallPico && <p>+ Fall & Pico Stitching (Rs. 300)</p>}
                                                    {item.hasUnderskirt && <p>+ Matching Underskirt (Rs. 800)</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => updateCartQty(item.product, item.variant, item.qty - 1)}
                                                className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 transition"
                                                aria-label={`Decrease quantity for ${item.name}`}
                                            >
                                                -
                                            </button>
                                            <span className="px-4 py-1.5 bg-gray-50 text-gray-800 text-sm font-medium min-w-12 text-center">
                                                {item.qty}
                                            </span>
                                            <button
                                                onClick={() => updateCartQty(item.product, item.variant, item.qty + 1)}
                                                className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 transition"
                                                aria-label={`Increase quantity for ${item.name}`}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right col-span-2 flex justify-between md:justify-end items-center">
                                        <span className="font-bold text-gray-900 text-lg mr-4">Rs.{(item.price * item.qty).toLocaleString('en-IN')}</span>
                                        <button
                                            onClick={() => removeFromCart(item.product, item.variant)}
                                            className="text-gray-400 hover:text-red-500 transition p-2"
                                            title="Remove Item"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full lg:w-96">
                        <div className="bg-gray-50 border border-gray-200 rounded p-6 sticky top-24">
                            <h2 className="text-xl font-serif text-gray-900 mb-6 pb-4 border-b border-gray-200">Order Summary</h2>

                            <div className="space-y-4 text-sm text-gray-600 mb-6 border-b border-gray-200 pb-6">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">Rs.{cartTotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Estimated Tax</span>
                                    <span className="font-medium text-gray-900">Calculated at checkout</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-amber-800">
                                    Rs.{cartTotal.toLocaleString('en-IN')}
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    if (user) {
                                        navigate('/checkout');
                                    } else {
                                        setIsLoginModalOpen(true);
                                    }
                                }}
                                className="w-full bg-amber-900 hover:bg-amber-800 text-white font-bold py-4 px-4 rounded shadow transition text-center uppercase tracking-wider text-sm"
                            >
                                Proceed To Secure Checkout
                            </button>

                            <div className="mt-6 text-xs text-gray-500 text-center flex flex-col items-center">
                                <ShieldCheck size={24} className="text-amber-600 mb-2" />
                                <p>100% Secure Payment | SSL Encrypted</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={() => {
                    setIsLoginModalOpen(false);
                    navigate('/checkout');
                }}
            />
        </div>
    );
};

export default CartPage;
