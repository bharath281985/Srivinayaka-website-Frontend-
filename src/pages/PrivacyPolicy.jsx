import React, { useEffect, useState } from 'react';
import API from '../api';
import { ShieldCheck, Lock, Eye, Flower2 } from 'lucide-react';

const PrivacyPolicy = () => {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await API.get('/api/pages/privacy-policy');
                setPage(data);
            } catch (error) {
                console.error('Privacy policy failed to load');
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
                <p className="font-serif text-xl text-[#2D241E] italic animate-pulse">Securing the Connection...</p>
            </div>
        </div>
    );

    if (!page) return (
        <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center p-6 text-center">
            <h1 className="text-3xl font-serif text-[#2D241E] italic">The privacy manifest is being archived.</h1>
        </div>
    );

    return (
        <div className="bg-[#FCFAF7] min-h-screen pb-32">
            <div className="bg-[#2D241E] py-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] pointer-events-none" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="text-[#DBB37C] font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">Data Sanctuary</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 italic">{page.title}</h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-px bg-[#DBB37C]/30"></div>
                        <Lock className="text-[#DBB37C]/60" size={24} />
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-20 border-t border-[#FCFAF7]">
                        <div className="text-center group">
                            <ShieldCheck className="mx-auto mb-4 text-[#A67C3D]" size={32} />
                            <h5 className="text-[#2D241E] font-serif italic text-lg mb-2">Secure Storage</h5>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Encrypted Data</p>
                        </div>
                        <div className="text-center group">
                            <Eye className="mx-auto mb-4 text-[#A67C3D]" size={32} />
                            <h5 className="text-[#2D241E] font-serif italic text-lg mb-2">Transparency</h5>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Clear Usage Policies</p>
                        </div>
                        <div className="text-center group">
                            <Lock className="mx-auto mb-4 text-[#A67C3D]" size={32} />
                            <h5 className="text-[#2D241E] font-serif italic text-lg mb-2">Your Rights</h5>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Control Your Data</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
