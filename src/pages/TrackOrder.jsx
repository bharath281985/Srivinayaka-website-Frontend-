import React, { useState } from 'react';
import API from '../api';
import { MapPin, Package, Clock, ShieldCheck, Search, ArrowRight, Flower2 } from 'lucide-react';

const normalizeOrderStatus = (status) => {
    const map = {
        Pending: 'Order Confirmed',
        Processing: 'Order Packed',
        'In-Production': 'Order Packed',
        'Out for Delhivary': 'Out for Delivery',
        Delhivered: 'Delivered',
    };

    return map[status] || status || 'Order Confirmed';
};

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const displayStatus = normalizeOrderStatus(order?.orderStatus);

    const onTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const { data } = await API.get(`/api/orders/track/${orderId.trim()}`);
            setOrder(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Manifest not found. Please verify the Order ID.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#FCFAF7] min-h-screen pb-32">
            {/* Minimalist Header */}
            <div className="bg-[#2D241E] py-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] pointer-events-none" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="text-[#DBB37C] font-black uppercase tracking-[0.5em] text-[10px] mb-6 block animate-fade-up">Precision Logistics</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 italic animate-fade-up [animation-delay:200ms]">Order Manifest</h1>
                    <p className="text-white/50 max-w-xl mx-auto font-light leading-relaxed animate-fade-up [animation-delay:400ms]">
                        Tracing the journey of your handcrafted heirloom from our studio to your sanctuary.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-16 relative z-20 max-w-4xl">
                {/* Search Card */}
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-[#EADECB] mb-12">
                    <form onSubmit={onTrack} className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input
                                className="w-full bg-[#FCFAF7] border border-[#EADECB] rounded-full px-14 py-5 focus:outline-none focus:border-[#DBB37C] transition-all font-serif text-lg"
                                placeholder="Enter Order Identifier (e.g. #65c1...)"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            className="bg-[#2D241E] text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-[#A67C3D] transition-all shadow-xl flex items-center justify-center gap-4 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Locate Order <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                    {error && (
                        <p className="text-[#A67C3D] mt-6 text-center italic font-medium animate-shake">{error}</p>
                    )}
                </div>

                {/* Result Manifest */}
                {order && (
                    <div className="bg-white rounded-[4rem] shadow-2xl border border-[#EADECB] overflow-hidden animate-fade-up">
                        <div className="bg-[#FCFAF7] px-12 py-8 border-b border-[#EADECB] flex flex-wrap justify-between items-center gap-6">
                            <div>
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Transit ID</span>
                                <p className="font-serif text-[#2D241E] text-xl">#{order._id}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">Current Status</span>
                                <div className="bg-[#2D241E] text-[#DBB37C] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                    {displayStatus}
                                </div>
                            </div>
                        </div>

                        <div className="p-12 grid md:grid-cols-2 gap-16">
                            <div className="space-y-10">
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] shrink-0">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Creation Date</h4>
                                        <p className="text-xl font-serif text-[#2D241E]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] shrink-0">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Treasury Value</h4>
                                        <p className="text-xl font-serif text-[#2D241E]">
                                            {localStorage.getItem('currencySymbol') || '₹'}{order.totalPrice?.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-12 h-12 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] shrink-0">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Payment Settlement</h4>
                                        <p className={`text-xl font-serif ${order.isPaid ? 'text-green-600' : 'text-[#A67C3D]'}`}>
                                            {order.isPaid ? 'Confirmed / Verified' : 
                                             (order.paymentMethod === 'Online' && order.paymentResult?.status) ? 
                                             (order.paymentResult.status === 'userCancelled' ? 'Cancelled by User' : 
                                              order.paymentResult.status === 'failure' ? 'Payment Failed' : 
                                              'Pending Settlement') :
                                             'Pending Settlement'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#FCFAF7] rounded-[3rem] p-10 relative overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                                    <Flower2 size={200} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest text-[#2D241E] mb-8 pb-4 border-b border-[#EADECB]">Transit Timeline</h4>
                                <div className="space-y-8 relative">
                                    <div className="absolute left-2.5 top-0 bottom-0 w-px bg-[#EADECB]"></div>

                                    <div className="flex items-center gap-6 relative">
                                        <div className={`w-5 h-5 rounded-full border-4 border-white z-10 ${order.isPaid ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-tighter italic">Treasury Secured</p>
                                    </div>
                                    <div className="flex items-center gap-6 relative">
                                        <div className={`w-5 h-5 rounded-full border-4 border-white z-10 ${['Order Packed', 'Shipped', 'Out for Delivery', 'Ready to Pickup', 'Delivered'].includes(displayStatus) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-tighter italic">Order Packed</p>
                                    </div>
                                    {order.shippingMethod !== 'Store Pickup' && order.shippingMethod !== 'Delivery By Rapido' && (
                                        <div className="flex items-center gap-6 relative">
                                            <div className={`w-5 h-5 rounded-full border-4 border-white z-10 ${['Shipped', 'Out for Delivery', 'Delivered'].includes(displayStatus) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-tighter italic">Shipped</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-6 relative">
                                        <div className={`w-5 h-5 rounded-full border-4 border-white z-10 ${['Out for Delivery', 'Ready to Pickup', 'Delivered'].includes(displayStatus) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-tighter italic">
                                            {order.shippingMethod === 'Store Pickup' || order.shippingMethod === 'Delivery By Rapido' ? 'Ready for Pickup / Driver Dispatch' : 'Out for Delivery'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6 relative">
                                        <div className={`w-5 h-5 rounded-full border-4 border-white z-10 ${displayStatus === 'Delivered' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-tighter italic">
                                            {order.shippingMethod === 'Store Pickup' ? 'Picked Up' : 'Delivered'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrder;
