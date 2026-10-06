import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';

const CONFETTI_COLORS = ['#16a34a', '#f59e0b', '#ef4444', '#2563eb', '#db2777', '#7c3aed'];
const CONFETTI_PIECES = Array.from({ length: 46 }, (_, index) => ({
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    left: `${4 + ((index * 23) % 92)}%`,
    delay: `${(index % 10) * 0.07}s`,
    duration: `${1.35 + (index % 6) * 0.13}s`,
    size: 7 + (index % 5),
    rotation: index % 2 === 0 ? 240 : -240,
}));

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        // Prevent going back to the payment gateway page
        window.history.replaceState(null, '', window.location.href);

        // Clear cart from localStorage on successful payment
        try {
            localStorage.removeItem('cart');
            localStorage.removeItem('svc_cart');
            // Dispatch storage event so other tabs/components update
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.warn('[PaymentSuccess] Could not clear cart from storage:', e);
        }
    }, []);

    return (
        <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center py-20 px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/50 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-50 rounded-full blur-[120px] -ml-64 -mb-64" />
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                {CONFETTI_PIECES.map((piece, index) => (
                    <span
                        key={`success-confetti-${index}`}
                        className="absolute top-[-80px] rounded-sm animate-[svcSuccessConfetti_var(--duration)_var(--delay)_ease-out_forwards]"
                        style={{
                            left: piece.left,
                            width: piece.size,
                            height: piece.size * 1.8,
                            backgroundColor: piece.color,
                            '--delay': piece.delay,
                            '--duration': piece.duration,
                            '--rotation': `${piece.rotation}deg`,
                        }}
                    />
                ))}
            </div>

            <div className="max-w-md w-full relative z-30">
                <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-amber-100 flex flex-col text-center">
                    <div className="bg-[#0f172a] p-8 text-white relative">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                            <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center border-4 border-white/20">
                                <CheckCircle size={40} className="text-white" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-serif mb-2">Payment Successful!</h3>
                        <p className="text-green-200 uppercase tracking-widest text-[10px] font-bold">Celebration unlocked</p>
                    </div>

                    <div className="p-8 space-y-6">
                        {orderId && (
                            <div>
                                <p className="text-gray-500 mb-2 uppercase tracking-tighter text-xs font-bold">Order Reference</p>
                                <h2 className="text-2xl font-serif text-amber-950">#{orderId.slice(-8).toUpperCase()}</h2>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => navigate('/account')}
                                className="flex-1 bg-amber-950 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2"
                            >
                                <Package size={18} /> View Orders
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 bg-white border-2 border-amber-950 text-amber-950 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-amber-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Home size={18} /> Back to Shop
                            </button>
                        </div>

                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-sm font-black uppercase tracking-[0.14em] text-emerald-700">WOW! Payment successful</p>
                            <p className="mt-2 text-[11px] font-bold leading-5 text-emerald-800">Your order is confirmed. A confirmation email has been sent with your order details.</p>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes svcSuccessConfetti {
                    0% { opacity: 0; transform: translateY(0) rotate(0deg); }
                    10% { opacity: 1; }
                    82% { opacity: 1; }
                    100% { opacity: 0; transform: translateY(110vh) rotate(var(--rotation)); }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccess;
