import React, { useEffect, useState } from 'react';
import API from '../api';
import { ChevronDown, Plus, Minus, MessageCircle, HelpCircle, Heart, ShieldCheck, Truck } from 'lucide-react';

const FAQs = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState(null);
    const [activeTab, setActiveTab] = useState('All');

    const categories = ['All', 'General', 'Shipping', 'Returns', 'Payment', 'Products'];

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const { data } = await API.get('/api/faqs');
                setFaqs(data);
            } catch (error) {
                console.error('Error fetching FAQs', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const filteredFaqs = activeTab === 'All'
        ? faqs
        : faqs.filter(faq => faq.category === activeTab);

    if (loading) return (
        <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-[#EADECB] border-t-[#DBB37C] rounded-full animate-spin"></div>
                <p className="font-serif text-xl text-[#2D241E] italic animate-pulse">Consulting the Archives...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[#FCFAF7] min-h-screen pb-32">
            {/* Elegant Hero Header */}
            <div className="bg-[#2D241E] py-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#DBB37C]/10 rounded-full blur-[100px] -mr-[250px] -mt-[250px]" />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="text-[#DBB37C] font-black uppercase tracking-[0.5em] text-[10px] mb-6 block animate-fade-up">Assistance Concierge</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 italic animate-fade-up [animation-delay:200ms]">Circular Queries</h1>
                    <p className="text-white/50 max-w-xl mx-auto font-light leading-relaxed animate-fade-up [animation-delay:400ms]">
                        Everything you need to know about our handcrafted heirlooms, from the loom to your doorstep.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-16 relative z-20">
                {/* Category Navigation */}
                <div className="bg-white p-4 rounded-3xl shadow-xl border border-[#EADECB] flex flex-wrap justify-center gap-2 mb-16 overflow-hidden max-w-4xl mx-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveTab(cat);
                                setOpenIndex(null);
                            }}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === cat
                                ? 'bg-[#2D241E] text-white shadow-lg'
                                : 'text-gray-400 hover:text-[#2D241E] hover:bg-[#FCFAF7]'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="max-w-4xl mx-auto">
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-[#EADECB] text-gray-400 font-serif italic text-xl">
                            The archives are currently quiet. Please check back soon.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFaqs.map((faq, idx) => {
                                const isOpen = openIndex === idx;
                                return (
                                    <div
                                        key={faq._id}
                                        className={`group bg-white rounded-[2rem] border transition-all duration-500 overflow-hidden ${isOpen ? 'border-[#DBB37C] shadow-2xl scale-[1.02]' : 'border-[#EADECB] hover:border-[#DBB37C]/50 hover:shadow-lg'}`}
                                    >
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : idx)}
                                            className="w-full text-left px-10 py-8 flex items-center justify-between gap-6"
                                        >
                                            <div className="flex items-center gap-6">
                                                <span className={`text-[10px] font-black transition-colors ${isOpen ? 'text-[#DBB37C]' : 'text-gray-300'}`}>0{idx + 1}</span>
                                                <h3 className={`text-xl font-serif transition-colors ${isOpen ? 'text-[#2D241E]' : 'text-[#4A3B30] group-hover:text-[#2D241E]'}`}>
                                                    {faq.question}
                                                </h3>
                                            </div>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-[#2D241E] text-white rotate-180' : 'bg-[#FCFAF7] text-[#A67C3D]'}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </button>

                                        <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="px-10 pb-10 ml-16">
                                                <div className="w-12 h-1 bg-[#DBB37C]/30 rounded-full mb-6"></div>
                                                <p className="text-gray-500 text-lg leading-relaxed font-light italic">
                                                    {faq.answer}
                                                </p>
                                                <div className="mt-8 flex items-center gap-4">
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#A67C3D]/10 text-[#A67C3D]">
                                                        Category: {faq.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Assistance Cards */}
                <div className="grid md:grid-cols-3 gap-8 mt-32 max-w-5xl mx-auto">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-[#EADECB] shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] mb-8 group-hover:bg-[#2D241E] group-hover:text-white transition-all">
                            <Truck size={28} />
                        </div>
                        <h4 className="text-xl font-serif text-[#2D241E] mb-4">Express Transit</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-light">Global fulfillment with real-time tracking from our atelier to your home.</p>
                    </div>
                    <div className="bg-white p-10 rounded-[2.5rem] border border-[#EADECB] shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] mb-8 group-hover:bg-[#2D241E] group-hover:text-white transition-all">
                            <ShieldCheck size={28} />
                        </div>
                        <h4 className="text-xl font-serif text-[#2D241E] mb-4">Purity Shield</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-light">Every drape is certified with the Silk Mark of India for 100% authenticity.</p>
                    </div>
                    <div className="bg-white p-10 rounded-[2.5rem] border border-[#EADECB] shadow-sm hover:shadow-xl transition-all group">
                        <div className="w-14 h-14 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] mb-8 group-hover:bg-[#2D241E] group-hover:text-white transition-all">
                            <MessageCircle size={28} />
                        </div>
                        <h4 className="text-xl font-serif text-[#2D241E] mb-4">Artisan Support</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-light">Need bespoke assistance? Our concierge is available for digital consultations.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQs;
