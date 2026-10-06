import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Instagram, Youtube } from 'lucide-react';
import API from '../api';

const MainLayout = () => {
    const location = useLocation();
    const isPaymentPage = location.pathname.startsWith('/payment/');
    
    const [settings, setSettings] = useState({
        whatsapp: '',
        instagram: '',
        youtube: '',
        facebook: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await API.get('/api/settings/general');
                if (data && data.value) {
                    const val = { ...data.value };
                    if (val.facebook && !val.youtube) val.youtube = val.facebook;
                    setSettings(val);
                }
            } catch (e) { console.error('Settings load fail'); }
        };
        fetchSettings();
    }, []);

    const whatsappLink = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}` : "https://wa.me/9392239145";
    const instagramLink = settings.instagram || "https://www.instagram.com/srivinayakacollections/";

    return (
        <div className="min-h-screen flex flex-col font-sans">
            {!isPaymentPage && <Header />}
            <main className="flex-grow">
                <Outlet />
            </main>
            {!isPaymentPage && <Footer />}
            
            {/* Floating Action Buttons */}
            {!isPaymentPage && (
                <div className="fixed bottom-6 right-6 hidden lg:flex flex-col gap-4 z-50">
                    {/* Floating Instagram Button */}
                    <a
                        href={instagramLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
                    >
                        <Instagram size={24} className="group-hover:rotate-12 transition-transform" />
                    </a>

                    {/* Floating YouTube Button */}
                    {(settings.youtube || settings.facebook) && (
                        <a
                            href={(settings.youtube || settings.facebook).startsWith('http') ? (settings.youtube || settings.facebook) : `https://youtube.com/${(settings.youtube || settings.facebook).startsWith('@') ? (settings.youtube || settings.facebook) : '@' + (settings.youtube || settings.facebook)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-red-600 text-white p-4 rounded-full shadow-2xl hover:bg-red-700 hover:scale-110 transition-all duration-300 group"
                        >
                            <Youtube size={24} className="group-hover:scale-120 transition-transform" />
                        </a>
                    )}

                    {/* Floating WhatsApp Button */}
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all duration-300 group"
                    >
                        <svg className="w-6 h-6 group-hover:-rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.996 23.996c-1.928 0-3.86-.48-5.608-1.42l-6.388 1.674 1.708-6.223c-1.043-1.802-1.594-3.85-1.594-5.947 0-6.55 5.334-11.88 11.882-11.88 6.547 0 11.88 5.33 11.88 11.88 0 6.55-5.333 11.88-11.88 11.88zm0-21.76c-5.438 0-9.88 4.442-9.88 9.88 0 1.738.455 3.444 1.32 4.945l.348.604-1.006 3.666 3.754-.984.588.336c1.458.835 3.098 1.275 4.876 1.275 5.437 0 9.88-4.44 9.88-9.88 0-5.438-4.443-9.88-9.88-9.88zm5.534 13.388c-.303-.15-1.794-.886-2.074-.988-.28-.102-.485-.15-.688.15-.204.302-.782.988-.958 1.19-.176.202-.352.227-.656.076-.304-.15-1.28-.47-2.438-1.5-1.007-.9-1.688-2.01-1.89-2.31-.203-.303-.02-.468.13-.618.134-.134.304-.352.456-.528.15-.177.202-.303.303-.505.102-.203.05-.38-.025-.53-.076-.15-.688-1.658-.942-2.268-.247-.59-.5-.51-.688-.52-.176-.01-.38-.01-.584-.01-.204 0-.534.076-.814.38-.28.303-1.066 1.042-1.066 2.538 0 1.498 1.092 2.946 1.244 3.148.152.203 2.146 3.275 5.2 4.59 2.21 1.052 2.95 1.134 4.02 1.05 1.135-.092 3.49-1.42 3.978-2.8.487-1.378.487-2.557.34-2.8-.145-.24-.55-.38-.854-.53z" /></svg>
                    </a>
                </div>
            )}
        </div>
    );
};

export default MainLayout;
