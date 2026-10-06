import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Apple, Play, Star, Instagram, Youtube, MessageCircle } from 'lucide-react';
import API from '../api';
import { getImageDisplayUrl } from '../config/urls';

const Footer = () => {
    const [settings, setSettings] = useState({
        siteName: 'Sri Vinayaka Collections',
        email: 'care@srivinayakacollections.com',
        phone: '+91 83094 70360',
        address: 'Artisan Hills, Banjara Marg, Hyderabad',
        instagram: '',
        youtube: '',
        whatsapp: '',
        footerLogo: '',
        footerTitle: 'THE HERITAGE HUB',
        footerDescription: 'Authentic, handcrafted sarees curated directly from the master weavers of India. Delivering heritage globally with love and precision.',
    });
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await API.get('/api/settings/general');
                if (data && data.value) setSettings(data.value);
            } catch (e) { console.error('Footer settings load fail'); }
        };
        fetchSettings();
    }, []);

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        try {
            await API.post('/api/newsletter/subscribe', { email: newsletterEmail });
            setIsSubscribed(true);
            setNewsletterEmail('');
            setTimeout(() => setIsSubscribed(false), 5000);
        } catch (error) {
            alert(error.response?.data?.message || 'Subscription failed');
        }
    };

    const whatsappLink = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}` : null;

    return (
        <footer className="bg-amber-950 text-amber-50/70 pt-12 mt-12 relative overflow-hidden">
            {/* Design Element */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
                    {/* Brand & Address Column */}
                    <div className="space-y-6 flex flex-col items-start text-left">
                        <div className="flex flex-col items-start">
                            {settings.footerLogo || settings.logo ? (
                                <img 
                                    src={getImageDisplayUrl(settings.footerLogo || settings.logo)} 
                                    alt={settings.siteName} 
                                    className="h-16 w-auto object-contain mb-4 filter brightness-0 invert opacity-90" 
                                />
                            ) : (
                                <h2 className="text-3xl font-serif font-black text-white tracking-tighter mb-1">{settings.siteName}</h2>
                            )}
                            <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500 font-bold">
                                {settings.footerTitle || 'The Heritage Hub'}
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed text-amber-50/50">
                            {settings.footerDescription || 'Authentic, handcrafted sarees curated directly from the master weavers of India. Delivering heritage globally with love and precision.'}
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-6 pt-4">
                            {settings.instagram && (
                                <a href={settings.instagram.startsWith('http') ? settings.instagram : `https://instagram.com/${settings.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-amber-500/60 hover:text-amber-500 transition-all hover:scale-110">
                                    <Instagram size={20} strokeWidth={1.5} />
                                </a>
                            )}
                            {(settings.youtube || settings.facebook) && (
                                <a href={(settings.youtube || settings.facebook).startsWith('http') ? (settings.youtube || settings.facebook) : `https://youtube.com/${(settings.youtube || settings.facebook).startsWith('@') ? (settings.youtube || settings.facebook) : '@' + (settings.youtube || settings.facebook)}`} target="_blank" rel="noopener noreferrer" className="text-amber-500/60 hover:text-amber-500 transition-all hover:scale-110">
                                    <Youtube size={20} strokeWidth={1.5} />
                                </a>
                            )}
                            {settings.whatsapp && (
                                <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-500/80 hover:text-green-400 transition-all hover:scale-110 drop-shadow-[0_0_8px_rgba(34,197,94,0.2)]">
                                    <MessageCircle size={22} strokeWidth={2} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Channels Column */}
                    <div className="md:pl-10">
                        <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-8 border-b border-amber-900 pb-2 inline-block">Navigation</h3>
                        <ul className="text-sm space-y-4 font-medium">
                            <li><Link to="/products" className="hover:text-amber-500 transition-all flex items-center gap-2 group">
                                <div className="w-1.5 h-1.5 bg-amber-800 rounded-full group-hover:bg-amber-500 transition-colors"></div> All Collections
                            </Link></li>
                            <li><Link to="/about" className="hover:text-amber-500 transition-all flex items-center gap-2 group">
                                <div className="w-1.5 h-1.5 bg-amber-800 rounded-full group-hover:bg-amber-500 transition-colors"></div> About Us
                            </Link></li>
                            <li><Link to="/contact" className="hover:text-amber-500 transition-all flex items-center gap-2 group">
                                <div className="w-1.5 h-1.5 bg-amber-800 rounded-full group-hover:bg-amber-500 transition-colors"></div> Contact Support
                            </Link></li>
                            <li><Link to="/track-order" className="hover:text-amber-500 transition-all flex items-center gap-2 group">
                                <div className="w-1.5 h-1.5 bg-amber-800 rounded-full group-hover:bg-amber-500 transition-colors"></div> Track Order
                            </Link></li>
                            <li><Link to="/blogs" className="hover:text-amber-500 transition-all flex items-center gap-2 group">
                                <div className="w-1.5 h-1.5 bg-amber-800 rounded-full group-hover:bg-amber-500 transition-colors"></div> Blogs / News
                            </Link></li>
                        </ul>
                    </div>

                    {/* Customer Pillars Column */}
                    <div>
                        <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-8 border-b border-amber-900 pb-2 inline-block">Customer Service</h3>
                        <ul className="text-sm space-y-4 font-medium">
                            <li><Link to="/shipping" className="hover:text-amber-500 transition">Shipping Policy</Link></li>
                            <li><Link to="/returns" className="hover:text-amber-500 transition">Return & Exchange</Link></li>
                            <li><Link to="/fabric-care" className="hover:text-amber-500 transition">Saree Care Guide</Link></li>
                            <li><Link to="/faqs" className="hover:text-amber-500 transition">FAQs</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-amber-500 transition">Privacy Policy</Link></li>
                            <li><Link to="/terms-conditions" className="hover:text-amber-500 transition">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="bg-amber-900/20 p-8 rounded-[2rem] border border-amber-900/50 shadow-inner">
                        <h3 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-6">Heritage Circle</h3>
                        <p className="text-xs leading-relaxed mb-8 italic opacity-60">Join our sanctuary for first revelations of new arrivals, artisan stories, and bridal previews.</p>
                        {isSubscribed ? (
                            <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl animate-fade-in flex flex-col items-center text-center">
                                <Star size={20} className="text-amber-500 mb-2 animate-pulse" fill="currentColor" />
                                <h4 className="text-white font-serif italic text-lg opacity-90 leading-tight">You've Entered <br />the Circle</h4>
                            </div>
                        ) : (
                            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="w-full bg-amber-950/40 border border-amber-900 px-6 py-4 rounded-xl text-sm focus:outline-none focus:border-amber-500 text-white placeholder:text-amber-900/60 transition-all"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-amber-600 hover:bg-white hover:text-amber-900 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 shadow-xl shadow-amber-900/40 active:scale-95">
                                    Enter the Circle
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="border-t border-amber-900/50 py-6 flex flex-col items-center gap-4 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-widest flex flex-col md:flex-row items-center gap-4 opacity-50">
                        <span>&copy; {new Date().getFullYear()} {settings.siteName}</span>
                        <span className="hidden md:block text-amber-900 opacity-30">|</span>
                        <span>
                            Designed by <a href="https://goexperts.in/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-all underline decoration-amber-900/30 underline-offset-4">Go Experts IT Solutions</a>
                        </span>
                    </div>
                    {(settings.androidLink || settings.iosLink) && (
                        <div className="flex items-center gap-4 border-t border-amber-900/50 md:border-t-0 pt-6 md:pt-0">
                            {settings.androidLink && (
                                <a
                                    href={settings.androidLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-black/40 hover:bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 border border-white/5 transition-all text-left group"
                                >
                                    <Play size={16} fill="white" stroke="none" className="group-hover:scale-110 transition-transform" />
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[7px] uppercase opacity-60">Get it on</span>
                                        <span className="text-[10px] font-bold">Google Play</span>
                                    </div>
                                </a>
                            )}
                            {settings.iosLink && (
                                <a
                                    href={settings.iosLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-black/40 hover:bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 border border-white/5 transition-all text-left group"
                                >
                                    <Apple size={18} fill="white" stroke="none" className="group-hover:scale-110 transition-transform" />
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[7px] uppercase opacity-60">Download on</span>
                                        <span className="text-[10px] font-bold">App Store</span>
                                    </div>
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
