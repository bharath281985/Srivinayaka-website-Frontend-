import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { AlertTriangle, Trash2, ShieldAlert, Flower2, ArrowLeft } from 'lucide-react';

const DeleteAccount = () => {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const { data } = await API.get('/api/pages/delete-account');
                setPage(data);
            } catch (error) {
                console.error('Delete account page failed to load');
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, []);

    const handleDelete = async () => {
        try {
            await API.delete('/api/users/profile');
            localStorage.removeItem('userInfo');
            navigate('/');
            window.location.reload(); // Ensure everything is cleared
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account. Please ensure you are logged in.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-[#EADECB] border-t-[#DBB37C] rounded-full animate-spin"></div>
                <p className="font-serif text-xl text-[#2D241E] italic animate-pulse">Closing the Ledger...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[#FCFAF7] min-h-screen pb-32">
            <div className="bg-[#2D241E] py-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] pointer-events-none" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="text-[#DBB37C] font-black uppercase tracking-[0.5em] text-[10px] mb-6 block animate-fade-up">Final Partition</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 italic animate-fade-up [animation-delay:200ms]">{page?.title || 'Account Deletion'}</h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-px bg-[#DBB37C]/30"></div>
                        <AlertTriangle className="text-[#DBB37C]/60" size={24} />
                        <div className="w-12 h-px bg-[#DBB37C]/30"></div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-4xl -mt-12 relative z-20">
                <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl border border-[#EADECB] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Trash2 size={200} />
                    </div>

                    <div className="relative z-10 text-center mb-16">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-8 shadow-inner">
                            <ShieldAlert size={48} />
                        </div>
                        <h2 className="text-3xl font-serif text-[#2D241E] mb-6 italic">This Action is Irreversible</h2>
                        <div
                            className="prose prose-xl prose-red text-gray-500 max-w-none italic font-light leading-relaxed mx-auto"
                            dangerouslySetInnerHTML={{ __html: page?.content || '' }}
                        />
                    </div>

                    <div className="bg-red-50/50 rounded-[2.5rem] p-10 border border-red-100 mb-12">
                        <h4 className="text-red-900 font-bold uppercase tracking-widest text-xs mb-4">By proceeding, you understand:</h4>
                        <ul className="space-y-4 text-sm text-red-800/70 italic">
                            <li className="flex gap-4"><span>✦</span> All order history and invoices will be permanently redacted.</li>
                            <li className="flex gap-4"><span>✦</span> Your profile and personal details will be purged from our secure vaults.</li>
                            <li className="flex gap-4"><span>✦</span> Any active subscriptions or membership tier benefits will be forfeited.</li>
                        </ul>
                    </div>

                    {error && <div className="text-red-600 text-center mb-8 font-medium bg-red-50 p-4 rounded-xl">{error}</div>}

                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <button
                            onClick={() => navigate('/account')}
                            className="flex items-center justify-center gap-4 px-12 py-5 rounded-full border border-[#EADECB] text-[#2D241E] font-black uppercase tracking-widest text-[10px] hover:bg-[#FCFAF7] transition-all"
                        >
                            <ArrowLeft size={16} /> Return to Sanctuary
                        </button>

                        {!confirming ? (
                            <button
                                onClick={() => setConfirming(true)}
                                className="bg-red-600 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all shadow-xl"
                            >
                                Initiate Account Deletion
                            </button>
                        ) : (
                            <button
                                onClick={handleDelete}
                                className="bg-red-900 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-2xl animate-pulse"
                            >
                                Confirm Final Deletion
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccount;
