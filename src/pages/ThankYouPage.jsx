import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home, Apple, Play, Sparkles, Star } from 'lucide-react';

const ThankYouPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-50 rounded-full blur-[120px] -ml-64 -mb-64" />

            <div className="max-w-4xl w-full relative z-10">
                <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(168,117,47,0.15)] overflow-hidden border border-amber-100 flex flex-col">
                    
                    {/* Top Section */}
                    <div className="bg-amber-950 p-8 md:p-20 text-center text-white relative">
                        {/* Motif Pattern Overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                        
                        <div className="relative inline-block mb-6 md:mb-10">
                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 animate-pulse" />
                            <div className="relative w-20 h-20 md:w-28 md:h-28 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 animate-bounce">
                                <CheckCircle size={40} className="text-white md:size-[56px] drop-shadow-2xl" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -top-2 -right-2 text-amber-400 animate-spin-slow">
                                <Sparkles size={20} className="md:size-[24px]" />
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-6xl font-serif mb-4 md:mb-6 leading-tight italic underline decoration-amber-500/30 underline-offset-8">Heritage, Reserved For You.</h1>
                        <div className="flex items-center justify-center gap-3">
                             <div className="h-[1px] w-6 md:w-8 bg-amber-500/50" />
                             <p className="text-amber-200 font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[8px] md:text-[10px]">Collection piece secured</p>
                             <div className="h-[1px] w-6 md:w-8 bg-amber-500/50" />
                        </div>
                    </div>

                    <div className="p-6 md:p-20 text-center flex-1 space-y-10 md:y-16">
                        {/* Quote & Reference */}
                        <div className="space-y-6 md:space-y-8">
                            <div className="relative inline-block">
                                <span className="absolute -top-4 -left-4 md:-top-6 md:-left-8 text-4xl md:text-6xl text-amber-100 font-serif overflow-hidden">"</span>
                                <p className="text-gray-500 text-base md:text-xl font-medium italic leading-relaxed max-w-xl mx-auto relative z-10">
                                    "A saree is not just a drape, it's a legacy passed through generations. We're honored to be part of your story."
                                </p>
                            </div>
                            
                            <div className="pt-2 flex flex-col items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Order Reference</span>
                                <div className="group relative">
                                    <div className="absolute -inset-4 bg-amber-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative font-serif text-2xl md:text-3xl text-amber-950 px-6 py-2 border-b-2 border-amber-950/10">
                                        #{orderId?.substring(orderId.length - 8).toUpperCase() || 'COLLECTION-SECURED'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Order Actions */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                            <button 
                                onClick={() => navigate('/account')}
                                className="w-full bg-amber-950 text-white py-5 rounded-2xl md:rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-black transition-all shadow-xl md:shadow-2xl active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                <Package size={16} className="md:size-[18px] group-hover:-translate-y-1 transition-transform" /> Order History
                            </button>
                            <button 
                                onClick={() => navigate('/')}
                                className="w-full bg-white border-2 border-amber-950 text-amber-950 py-5 rounded-2xl md:rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-amber-50 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                <Home size={16} className="md:size-[18px] group-hover:-rotate-6 transition-transform" /> Back to Atelier
                            </button>
                        </div>

                        {/* App Promotion Section */}
                        <div className="pt-10 md:pt-16 border-t border-gray-100">
                             <div className="bg-[#1A1A1A] rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 text-center lg:text-left relative overflow-hidden group">
                                 {/* Decorative elements */}
                                 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -ml-16 -mb-16" />
                                 
                                 <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 relative z-10">
                                     <div className="flex-1 space-y-4 md:space-y-6">
                                         <div className="flex items-center justify-center lg:justify-start gap-2">
                                             <Star size={10} className="text-amber-500 fill-amber-500" />
                                             <span className="text-amber-500 font-black uppercase tracking-[0.3em] text-[9px]">Mobile App</span>
                                         </div>
                                         <h3 className="text-2xl md:text-3xl font-serif text-white italic">Track your silk treasures <br className="hidden md:block" /> from your palm.</h3>
                                         <p className="text-white/40 text-[10px] md:text-sm leading-relaxed max-w-sm mx-auto lg:mx-0">Get real-time updates and exclusive access.</p>
                                     </div>
                                     
                                     <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                         <a href="#" className="flex-1 flex items-center justify-center lg:justify-start gap-3 bg-black border border-white/10 hover:border-amber-500/50 transition-all rounded-xl md:rounded-2xl px-5 py-3 md:px-6 md:py-4 group">
                                             <Apple size={28} className="text-white md:size-[32px] fill-white" />
                                             <div className="flex flex-col text-left">
                                                 <span className="text-[7px] font-black uppercase tracking-widest text-white/40 mb-1">Download on the</span>
                                                 <span className="text-base md:text-lg font-bold text-white leading-none">App Store</span>
                                             </div>
                                         </a>
                                         <a href="#" className="flex-1 flex items-center justify-center lg:justify-start gap-3 bg-black border border-white/10 hover:border-amber-500/50 transition-all rounded-xl md:rounded-2xl px-5 py-3 md:px-6 md:py-4 group">
                                             <Play size={24} className="text-[#DBB37C] md:size-[28px] fill-[#DBB37C]" />
                                             <div className="flex flex-col text-left">
                                                 <span className="text-[7px] font-black uppercase tracking-widest text-white/40 mb-1">Get it on</span>
                                                 <span className="text-base md:text-lg font-bold text-white leading-none">Google Play</span>
                                             </div>
                                         </a>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        <p className="text-[9px] text-gray-400 font-medium uppercase tracking-[0.2em] italic">
                            A royal confirmation scroll sent to your email.
                        </p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}} />
        </div>
    );
};

export default ThankYouPage;

