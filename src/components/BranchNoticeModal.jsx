import React, { useState } from 'react';
import { X, Sparkles, Phone } from 'lucide-react';

const MESSAGES = {
    en: {
        lang: 'English',
        title: 'We’ll Be Back Soon! 🎉',
        desc: 'We’re currently preparing our new branch to serve you better. Orders are temporarily paused during this transition. We truly appreciate your patience and understanding, and we look forward to serving you soon!',
    },
    te: {
        lang: 'తెలుగు',
        title: 'మేము త్వరలోనే తిరిగి వస్తాము! 🎉',
        desc: 'మీకు మరింత మెరుగైన సేవలను అందించేందుకు మా కొత్త బ్రాంచ్ను ప్రస్తుతం సిద్ధం చేస్తున్నాము. ఈ మార్పుల కారణంగా ఆర్డర్లను తాత్కాలికంగా నిలిపివేశాము. మీ సహనం మరియు అవగాహనకు మనస్పూర్తిగా ధన్యవాదాలు. త్వరలోనే మళ్లీ మీకు సేవలందించేందుకు ఎదురుచూస్తున్నాము!',
    },
    hi: {
        lang: 'हिंदी',
        title: 'हम जल्द ही वापस आएंगे! 🎉',
        desc: 'आपको और बेहतर सेवा देने के लिए हम अपनी नई ब्रांच की तैयारी कर रहे हैं। इस बदलाव के दौरान ऑर्डर फिलहाल अस्थायी रूप से रोक दिए गए हैं। आपके धैर्य और समझ के लिए हम आपका दिल से धन्यवाद करते हैं। हम जल्द ही दोबारा आपकी सेवा करने के लिए उत्सुक हैं!',
    },
};

const BranchNoticeModal = ({ isOpen, onClose }) => {
    const [activeLang, setActiveLang] = useState('en');

    if (!isOpen) return null;

    const current = MESSAGES[activeLang];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-amber-100 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-all"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                {/* Header Icon */}
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto mb-5 shadow-inner text-3xl">
                    🎉
                </div>

                {/* Language Switcher Tabs */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {Object.entries(MESSAGES).map(([key, item]) => (
                        <button
                            key={key}
                            onClick={() => setActiveLang(key)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                                activeLang === key
                                    ? 'bg-amber-900 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {item.lang}
                        </button>
                    ))}
                </div>

                {/* Active Language Content */}
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-serif font-black text-gray-900 mb-4 leading-snug">
                        {current.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed font-sans px-2">
                        {current.desc}
                    </p>
                </div>

                {/* Additional Language Preview Snippets */}
                <div className="space-y-3 pt-4 border-t border-gray-100 text-left">
                    {Object.entries(MESSAGES)
                        .filter(([key]) => key !== activeLang)
                        .map(([key, item]) => (
                            <div
                                key={key}
                                onClick={() => setActiveLang(key)}
                                className="p-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-100/60 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                                        {item.lang}
                                    </span>
                                    <span className="text-[10px] text-amber-600 font-bold">Switch</span>
                                </div>
                                <p className="text-xs font-medium text-gray-700 line-clamp-2">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 pt-2">
                    <a
                        href="https://wa.me/919392239145?text=Hi%2C%20I%20have%20an%20inquiry%20regarding%20orders%20at%20Sri%20Vinayaka%20Collections"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
                    >
                        <Phone size={15} />
                        WhatsApp Support
                    </a>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 px-4 rounded-2xl bg-amber-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest transition shadow-md"
                    >
                        Understood
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BranchNoticeModal;
