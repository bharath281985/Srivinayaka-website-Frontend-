import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ShoppingBag, Home, HelpCircle } from 'lucide-react';

const PaymentFailure = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        // Replace history so user can't go back to the payment gateway page
        window.history.replaceState(null, '', window.location.href);
    }, []);

    return (
        <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-100/50 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-50 rounded-full blur-[120px] -ml-64 -mb-64" />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-red-100 flex flex-col text-center">
                    <div className="bg-red-900 p-8 text-white relative">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                            <div className="relative w-20 h-20 bg-red-500 rounded-full flex items-center justify-center border-4 border-white/20">
                                <XCircle size={40} className="text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-serif mb-2 text-white">Payment Failed</h1>
                        <p className="text-red-200 uppercase tracking-widest text-[10px] font-bold">Transaction incomplete</p>
                    </div>

                    <div className="p-8 space-y-6">
                        {orderId && (
                            <div>
                                <p className="text-gray-500 mb-2 uppercase tracking-tighter text-xs font-bold font-serif opacity-50">Order Reference</p>
                                <h2 className="text-2xl font-serif text-amber-950">#{orderId.slice(-8).toUpperCase()}</h2>
                                <p className="text-[10px] text-gray-400 mt-1 font-mono">Full ID: {orderId}</p>
                            </div>
                        )}

                        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left">
                            <p className="text-xs font-black uppercase tracking-wider text-orange-700 mb-1">🛒 Your cart is still saved</p>
                            <p className="text-[11px] text-orange-800 font-medium leading-5">No amount was deducted. You can safely retry the payment from your cart. If any amount was charged, it will be refunded within 3–5 business days.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/checkout')}
                                className="flex-1 bg-red-800 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={18} /> Retry Payment
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="flex-1 bg-white border-2 border-red-800 text-red-800 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <HelpCircle size={18} /> Get Support
                            </button>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full text-[10px] text-gray-400 underline hover:text-gray-600 transition flex items-center justify-center gap-1"
                        >
                            <Home size={12} /> Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
