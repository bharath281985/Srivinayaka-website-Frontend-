import React, { useEffect, useState } from 'react';
import API from '../api';
import { FileText, Scale, Gavel, Flower2 } from 'lucide-react';

const TermsAndConditions = () => {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await API.get('/api/pages/terms-and-conditions');
                setPage(data);
            } catch (error) {
                console.error('Terms and conditions failed to load');
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
                <p className="font-serif text-xl text-[#2D241E] italic animate-pulse">Drafting the Covenant...</p>
            </div>
        </div>
    );

    if (!page) return (
        <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center p-6 text-center">
            <h1 className="text-3xl font-serif text-[#2D241E] italic">The terms of use are being updated.</h1>
        </div>
    );

    return (
        <div className="bg-[#FCFAF7] min-h-screen pb-32">
            <div className="bg-[#FCFAF7] border-b border-[#EADECB] py-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] pointer-events-none" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="text-[#A67C3D] font-black uppercase tracking-[0.5em] text-[10px] mb-6 block">Our Covenant</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-[#2D241E] mb-6 italic">{page.title}</h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-px bg-[#A67C3D]/30"></div>
                        <FileText className="text-[#A67C3D]" size={24} />
                        <div className="w-12 h-px bg-[#A67C3D]/30"></div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-4xl -mt-12 relative z-20">
                <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-[#EADECB] relative overflow-hidden">
                    <div
                        className="prose prose-2xl prose-amber max-w-none text-gray-600 leading-[1.8] font-light italic"
                        dangerouslySetInnerHTML={{
                            __html: page.content.replace(/<p>/g, '<p class="mb-8">').replace(/<li>/g, '<li class="mb-4">')
                        }}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20 pt-20 border-t border-[#FCFAF7]">
                        <div className="flex gap-6 group">
                            <div className="w-12 h-12 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] shrink-0">
                                <Scale size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-serif text-[#2D241E] mb-2 uppercase tracking-tight italic">Fair Usage</h4>
                                <p className="text-sm text-gray-400 font-light">We believe in transparent and fair interaction with our global community.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 group">
                            <div className="w-12 h-12 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] shrink-0">
                                <Gavel size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-serif text-[#2D241E] mb-2 uppercase tracking-tight italic">Legal Framework</h4>
                                <p className="text-sm text-gray-400 font-light">Binding agreements to ensure security for both artisans and collectors.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
