import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import { ShoppingBag, X, Heart } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/urls';

const Wishlist = () => {
    const { wishlistItems, toggleWishlist } = useContext(WishlistContext);

    if (wishlistItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center bg-white min-h-[60vh] flex flex-col items-center justify-center">
                <div className="p-8 bg-amber-50 rounded-full mb-8 text-amber-200">
                    <Heart size={80} strokeWidth={1} />
                </div>
                <h1 className="text-4xl font-serif text-gray-900 mb-4">Your Wishlist is Empty</h1>
                <p className="text-gray-500 mb-12 max-w-md mx-auto">Start curating your personal heritage collection by saving your favorite drapes today.</p>
                <Link to="/products" className="bg-amber-900 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-xs hover:bg-black transition shadow-2xl">
                    Discover Collections
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-[#FCFAF7] min-h-screen py-20 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-16">
                    <span className="text-amber-600 font-black tracking-[0.4em] text-[10px] mb-4 block">Personal Archive</span>
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 leading-tight">Your Curated <br /><span className="italic">Treasures</span></h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {wishlistItems.map((item) => (
                        <div key={item._id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 relative">
                            <button
                                onClick={() => toggleWishlist(item)}
                                className="absolute top-6 right-6 z-20 p-3 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition shadow-lg"
                            >
                                <X size={18} />
                            </button>

                            <Link to={`/product/${item.slug || item._id}`} className="block relative aspect-[3/4] overflow-hidden">
                                <img
                                    src={item.images?.[0] || `${IMAGE_BASE_URL}/uploads/banarasi.png`}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/80 to-transparent">
                                    <span className="bg-[#DBB37C] text-[#2D241E] text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-widest inline-flex items-center gap-2">
                                        <ShoppingBag size={10} /> Move to Bag
                                    </span>
                                </div>
                            </Link>

                            <div className="p-8 text-center">
                                <p className="text-amber-600 font-black text-[9px] uppercase tracking-[0.3em] mb-3">{item.fabric || 'Pure Heritage'}</p>
                                <h3 className="font-serif text-2xl text-gray-900 mb-2 truncate">
                                    <Link to={`/product/${item.slug || item._id}`}>{item.name}</Link>
                                </h3>
                                <p className="text-xl font-bold text-gray-900">₹{item.basePrice.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
