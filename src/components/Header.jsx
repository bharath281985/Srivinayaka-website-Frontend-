import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, MapPin, Menu, X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { AuthContext } from '../context/AuthContext';
import LoginModal from './LoginModal';
import API from '../api';
import { getImageDisplayUrl } from '../config/urls';

const Header = () => {
    const { cartCount } = useContext(CartContext);
    const { wishlistItems } = useContext(WishlistContext);
    const { user } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const navigate = useNavigate();

    const [settings, setSettings] = useState({});
    const [placeholder, setPlaceholder] = useState("");
    const placeholders = [
        "Find your perfect drape...",
        "Search for Kanjivaram Silk...",
        "Elegant Banarasi Archive...",
        "Pure Chanderi Collections...",
        "Hand-curated Silk Sarees...",
        "Latest Wedding Reveal...",
        "Archive Search starts here..."
    ];

    useEffect(() => {
        let i = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        const type = () => {
            const currentFullText = placeholders[i % placeholders.length];

            if (isDeleting) {
                setPlaceholder(currentFullText.substring(0, charIndex - 1));
                charIndex--;
                typeSpeed = 50;
            } else {
                setPlaceholder(currentFullText.substring(0, charIndex + 1));
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === currentFullText.length) {
                isDeleting = true;
                typeSpeed = 2000; // Pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                i++;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        };

        const timeoutId = setTimeout(type, typeSpeed);
        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, setRes] = await Promise.all([
                    API.get('/api/categories'),
                    API.get('/api/settings/general')
                ]);
                setCategories(catRes.data.filter(c => !c.parent).slice(0, 6));
                if (setRes.data && setRes.data.value) setSettings(setRes.data.value);
            } catch (error) {
                console.error('Error fetching header content');
            }
        };
        fetchData();
    }, []);

    return (
        <header className="bg-white sticky top-0 z-[999]">
            <div className="bg-white border-b border-gray-50 shadow-sm relative z-[998]">
                <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between py-1.5 md:py-3 gap-4 xl:gap-8">
                    {/* Logo Section */}
                    <div className="flex items-center flex-shrink-0">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden text-gray-700 p-2 hover:bg-amber-50 rounded-xl transition mr-2"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <Link to="/" className="group inline-block pl-2 md:pl-6">
                            <img
                                src={settings.logo ? getImageDisplayUrl(settings.logo) : "/logo.png"}
                                alt={settings.siteName || "Sri Vinayaka Collections"}
                                className="h-14 md:h-16 lg:h-20 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                        </Link>
                    </div>

                    {/* Navigation Row - Now Centered in the middle */}
                    <nav className="hidden lg:block flex-1">
                        <ul className="flex justify-center items-center gap-1 xl:gap-6 text-[10px] font-black uppercase tracking-[0.15em] text-gray-800">
                            <li className="px-3 group">
                                <Link to="/products" className="hover:text-amber-700 transition relative">
                                    All Products
                                    <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-amber-600 scale-x-0 group-hover:scale-x-100 transition duration-300"></span>
                                </Link>
                            </li>
                            {categories.map((cat) => (
                                <li key={cat._id} className="px-3 group">
                                    <Link to={`/products?category=${cat.slug}`} className="hover:text-amber-700 transition relative">
                                        {cat.name}
                                        <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-amber-600 scale-x-0 group-hover:scale-x-100 transition duration-300"></span>
                                    </Link>
                                </li>
                            ))}
                            <li className="px-3 group text-amber-600">
                                <Link to="/products?bestseller=true" className="transition relative">
                                    Bestsellers
                                    <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-amber-600 scale-x-0 group-hover:scale-x-100 transition duration-300"></span>
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Utility Icons & Desktop Search */}
                    <div className="flex items-center gap-3 md:gap-6 lg:gap-8">
                        {/* Desktop Search (Hidden on Mobile) */}
                        <div className="hidden xl:block">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (searchTerm.trim()) navigate(`/products?q=${encodeURIComponent(searchTerm)}`);
                                }}
                                className="relative group"
                            >
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-52 xl:w-64 bg-gray-50/50 border border-gray-100 px-10 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-amber-200 focus:bg-white transition-all shadow-sm placeholder:text-gray-300"
                                />
                                <Search size={14} strokeWidth={2.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-700 transition-colors" />
                                {searchTerm && <button type="button" onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition"><X size={14} /></button>}
                            </form>
                        </div>

                        {/* Mobile Search Icon */}
                        <div onClick={() => setIsMenuOpen(true)} className="xl:hidden cursor-pointer text-gray-700 hover:text-amber-700 flex flex-col items-center gap-1 group transition">
                            <Search size={22} strokeWidth={1.5} className="group-hover:scale-110 transition" />
                        </div>

                        <div onClick={() => user ? navigate('/account') : setIsLoginOpen(true)} className="cursor-pointer text-gray-700 hover:text-amber-700 flex flex-col items-center gap-1 group transition">
                            <User size={22} strokeWidth={1.5} className="group-hover:scale-110 transition" />
                            <span className="text-[9px] font-bold uppercase tracking-widest hidden md:block">Account</span>
                        </div>

                        <Link to="/wishlist" className="text-gray-700 hover:text-amber-700 flex flex-col items-center gap-1 group transition relative">
                            <div className="relative">
                                {wishlistItems.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[8px] rounded-full h-3 w-3 flex items-center justify-center font-black animate-in zoom-in">
                                        {wishlistItems.length}
                                    </span>
                                )}
                                <Heart size={22} strokeWidth={1.5} className="group-hover:scale-110 transition" />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest hidden md:block">Wishlist</span>
                        </Link>

                        <Link to="/cart" className="text-amber-900 hover:text-amber-700 flex flex-col items-center gap-1 relative group transition">
                            <div className="relative">
                                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-black animate-in zoom-in">
                                    {cartCount}
                                </span>
                                <ShoppingBag size={24} strokeWidth={2} className="group-hover:scale-110 transition" />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest hidden md:block">Cart</span>
                        </Link>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="fixed left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
                        <div className="p-8 flex justify-between items-center border-b border-gray-50 bg-amber-50/30">
                            <img src={settings.logo ? getImageDisplayUrl(settings.logo) : "/logo.png"} alt={settings.siteName || "Sri Vinayaka Collections"} className="h-12 w-auto object-contain" />
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-amber-100 rounded-full transition"><X size={24} /></button>
                        </div>
                        <div className="p-8 flex flex-col space-y-6 text-sm font-bold uppercase tracking-widest text-gray-800">
                            {/* Mobile Search */}
                            <form onSubmit={(e) => { e.preventDefault(); if (searchTerm.trim()) navigate(`/products?q=${searchTerm}`); setIsMenuOpen(false); }} className="flex w-full bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-500/20 mb-4 transition-all duration-300">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full px-5 py-3 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400"
                                />
                                <button type="submit" className="bg-amber-900 text-white px-5 py-3">
                                    <Search size={16} />
                                </button>
                            </form>

                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:text-amber-600 transition">Home</Link>
                            <div className="h-px bg-gray-100"></div>
                            <span className="text-[10px] text-gray-400 mb-2">Shop Categories</span>
                            {categories.map(cat => (
                                <Link key={cat._id} to={`/products?category=${cat.slug}`} onClick={() => setIsMenuOpen(false)} className="hover:text-amber-600 transition">{cat.name}</Link>
                            ))}
                            <div className="h-px bg-gray-100"></div>
                            <Link to="/track-order" onClick={() => setIsMenuOpen(false)} className="hover:text-amber-600 transition">Track Order</Link>
                            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-amber-600 transition">About Our Story</Link>
                            <Link to="/faqs" onClick={() => setIsMenuOpen(false)} className="hover:text-amber-600 transition">Customer Care</Link>
                        </div>
                    </div>
                </div>
            )}

            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={() => navigate('/account')} />
        </header>
    );
};

export default Header;
