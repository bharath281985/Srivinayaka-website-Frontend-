import React, { useEffect, useState } from 'react';
import API from '../api';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle, ShieldCheck } from 'lucide-react';

const ContactUs = () => {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [settings, setSettings] = useState({
        email: 'care@srivinayakacollections.com',
        phone: '+91 83094 70360',
        address: 'Artisan Hills, Banjara Marg, Hyderabad'
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const [pageRes, settingsRes] = await Promise.all([
                    API.get('/api/pages/contact-us'),
                    API.get('/api/settings/general')
                ]);
                if (pageRes.data) setPage(pageRes.data);
                if (settingsRes.data && settingsRes.data.value) setSettings(settingsRes.data.value);
            } catch (error) {
                console.error('Contact data failed to load');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await API.post('/api/tickets', formData);
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            alert('Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-[#EADECB] border-t-[#DBB37C] rounded-full animate-spin"></div>
                <p className="font-serif text-xl text-[#2D241E] italic animate-pulse">Establishing Connection...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[#FCFAF7] min-h-screen pb-32">
            <div className="bg-[#2D241E] py-32 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] pointer-events-none" />
                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="text-[#DBB37C] font-black uppercase tracking-[0.5em] text-[10px] mb-6 block animate-fade-up">Direct Concierge</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 italic animate-fade-up [animation-delay:200ms]">Get in Touch</h1>
                    <p className="text-white/50 max-w-xl mx-auto font-light leading-relaxed animate-fade-up [animation-delay:400ms]">
                        Whether it's a bespoke drapery request or a query about our heritage looms, our curators are here to assist.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-6xl -mt-16 relative z-20">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Contact Info Sidebar */}
                    <div className="lg:w-1/3 space-y-6">
                        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-[#EADECB]">
                            <h3 className="text-2xl font-serif text-[#2D241E] mb-8 italic">Contact Information</h3>
                            <div className="space-y-10">
                                <div className="flex gap-6 group">
                                    <div className="w-12 h-12 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] group-hover:bg-[#2D241E] group-hover:text-white transition-all">
                                        <Mail size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Email Address</h4>
                                        <a href={`mailto:${settings.email}`} className="text-sm font-serif text-[#2D241E] hover:text-[#A67C3D] transition-colors whitespace-nowrap">{settings.email}</a>
                                    </div>
                                </div>
                                <div className="flex gap-6 group">
                                    <div className="w-12 h-12 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] group-hover:bg-[#2D241E] group-hover:text-white transition-all">
                                        <Phone size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Phone Number</h4>
                                        <a href={`tel:${settings.phone}`} className="text-base font-serif text-[#2D241E] hover:text-[#A67C3D] transition-colors">{settings.phone}</a>
                                    </div>
                                </div>
                                <div className="flex gap-6 group">
                                    <div className="w-12 h-12 bg-[#FCFAF7] rounded-2xl flex items-center justify-center text-[#A67C3D] group-hover:bg-[#2D241E] group-hover:text-white transition-all">
                                        <MapPin size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Office Address</h4>
                                        <p className="text-base font-serif text-[#2D241E] leading-relaxed">{settings.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Contact Form */}
                    <div className="lg:w-2/3">
                        <div className="bg-white p-10 md:p-16 rounded-[4rem] shadow-2xl border border-[#EADECB]">
                            {submitted ? (
                                <div className="text-center py-20 animate-fade-up">
                                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h2 className="text-3xl font-serif text-[#2D241E] mb-4 italic">Inquiry Submitted</h2>
                                    <p className="text-gray-500 max-w-md mx-auto italic font-light">Your request has been securely placed in our archives. Our curators will respond shortly.</p>
                                    <button onClick={() => setSubmitted(false)} className="mt-12 text-[#A67C3D] font-black uppercase tracking-widest text-[10px] border-b border-[#A67C3D]/20 hover:border-text-[#A67C3D] transition-all">Send another message</button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-4xl font-serif text-[#2D241E] mb-8 italic">Direct Inquiry</h2>
                                    <div
                                        className="prose prose-amber text-gray-500 mb-12 italic font-light"
                                        dangerouslySetInnerHTML={{ __html: page?.content || '' }}
                                    />

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
                                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#FCFAF7] border border-[#EADECB] rounded-full px-8 py-5 focus:outline-none focus:border-[#DBB37C] transition-all font-serif" placeholder="Aarti Sharma" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Digital Mail</label>
                                                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#FCFAF7] border border-[#EADECB] rounded-full px-8 py-5 focus:outline-none focus:border-[#DBB37C] transition-all font-serif" placeholder="aarti@example.com" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Subject</label>
                                            <input required type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-[#FCFAF7] border border-[#EADECB] rounded-full px-8 py-5 focus:outline-none focus:border-[#DBB37C] transition-all font-serif" placeholder="Bespoke Bridal Query" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Inquiry Specifics</label>
                                            <textarea required name="message" value={formData.message} onChange={handleChange} rows="6" className="w-full bg-[#FCFAF7] border border-[#EADECB] rounded-[2rem] px-8 py-6 focus:outline-none focus:border-[#DBB37C] transition-all font-serif" placeholder="Tell us about the dream drape you are looking for..."></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full bg-[#2D241E] text-white py-6 rounded-full font-black uppercase tracking-widest text-[11px] hover:bg-[#A67C3D] transition-all shadow-xl flex items-center justify-center gap-4 disabled:opacity-50"
                                        >
                                            {submitting ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>Submit <Send size={18} /></>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
