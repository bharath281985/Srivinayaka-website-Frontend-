import React, { useEffect, useState } from 'react';
import API from '../api';
import { Truck, Globe, Package, ShieldCheck, Flower2 } from 'lucide-react';

const ShippingPolicy = () => {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await API.get('/api/pages/shipping-policy');
                setPage(data);
            } catch (error) {
                console.error('Shipping policy failed to load');
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-[#EADECB] border-t-[#DBB37C] rounded-full animate-spin"></div>
                <p className="font-serif text-xl text-[#2D241E] italic animate-pulse">Calculating Transit Routes...</p>
            </div>
        </div>
    );

    if (!page) return (
        <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center p-6 text-center">
            <h1 className="text-3xl font-serif text-[#2D241E] italic">The shipping manifest is being updated.</h1>
        </div>
    );

    return (
        <div className="bg-[#FCFAF7] min-h-screen pb-32">
            {/* Transit Header */}
            <div className="bg-[#2D241E] py-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] pointer-events-none" />
                <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#DBB37C]/5 rounded-full blur-[100px] -ml-[200px] -mt-[200px]" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="text-[#DBB37C] font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">Global Mobility</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 italic">{page.title}</h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-px bg-[#DBB37C]/30"></div>
                        <Globe className="text-[#DBB37C]/60 transition-all hover:rotate-180 duration-1000" size={24} />
                        <div className="w-12 h-px bg-[#DBB37C]/30"></div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-4xl -mt-12 relative z-20">
                <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-[#EADECB] relative">
                    <div
                        className="prose prose-2xl prose-amber max-w-none text-gray-600 leading-[1.8] font-light italic"
                        dangerouslySetInnerHTML={{
                            __html: page.content.replace(/<p>/g, '<p class="mb-8">').replace(/<li>/g, '<li class="mb-4">')
                        }}
                    />

                    {/* Transit Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-20 border-t border-[#FCFAF7]">
                        <div className="text-center group">
                            <Truck className="mx-auto mb-4 text-[#A67C3D] group-hover:translate-x-4 transition-transform" size={32} />
                            <h5 className="text-[#2D241E] font-serif italic text-lg mb-2">Doorstep Delivery</h5>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-loose">Across 180+ Countries</p>
                        </div>
                        <div className="text-center group">
                            <ShieldCheck className="mx-auto mb-4 text-[#A67C3D] group-hover:scale-110 transition-transform" size={32} />
                            <h5 className="text-[#2D241E] font-serif italic text-lg mb-2">Insured Transit</h5>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-loose">Full Protection Guaranteed</p>
                        </div>
                        <div className="text-center group">
                            <Package className="mx-auto mb-4 text-[#A67C3D] group-hover:-translate-y-2 transition-transform" size={32} />
                            <h5 className="text-[#2D241E] font-serif italic text-lg mb-2">Heritage Packing</h5>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-loose">Secure Artisan Boxing</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;
