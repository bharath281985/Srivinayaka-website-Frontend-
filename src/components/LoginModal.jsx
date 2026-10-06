import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Phone, ShieldCheck, ArrowRight, Loader2, User as UserIcon, Mail, Camera } from 'lucide-react';
import API from '../api';

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const { loginWithOTP } = useContext(AuthContext);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: profile details
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);

    // Step 3 state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setPhone('');
            setOtp('');
            setError('');
            setTimer(0);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, [isOpen]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);



    const startTimer = () => {
        setTimer(30);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        // Take only 10 numbers from input
        const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
        if (cleanPhone.length < 10) {
            setError('Please enter a valid 10-digit mobile number');
            setLoading(false);
            return;
        }

        try {
            // Add 91 in the website when sending to API
            const fullPhone = '91' + cleanPhone;
            await API.post('/api/users/send-otp', { phone: fullPhone });
            startTimer();
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
            const fullPhone = '91' + cleanPhone;
            const res = await loginWithOTP(fullPhone, otp);
            if (res.isNewUser) {
                setStep(3);
            } else {
                onLoginSuccess();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Invalid OTP. Please check and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (timer > 0 || loading) return;
        setError('');
        setLoading(true);
        try {
            const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
            const fullPhone = '91' + cleanPhone;
            await API.post('/api/users/send-otp', { phone: fullPhone });
            startTimer();
            setError('OTP resent successfully!');
            setTimeout(() => setError(''), 3000); // Clear success message after 3s
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let uploadedImageUrl = '';
            if (profileImage) {
                const formData = new FormData();
                formData.append('image', profileImage);
                const uploadRes = await API.post('/api/upload', formData);
                uploadedImageUrl = uploadRes.data;
            }

            const profileData = {
                name,
                email,
                age: Number(age),
                gender,
                ...(uploadedImageUrl && { profileImage: uploadedImageUrl })
            };

            const { data } = await API.put('/api/users/profile', profileData);

            // Update local storage so the new name is immediately available
            localStorage.setItem('saree_user', JSON.stringify(data));

            onLoginSuccess();
            window.location.reload(); // Quick refresh to update headers/context visually
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete profile. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-amber-900 px-6 py-8 text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-white/70 hover:text-white hover:bg-white/10 p-1 rounded-full transition"
                    >
                        <X size={24} />
                    </button>
                    <h2 className="text-3xl font-serif font-bold text-white mb-2 leading-tight">Welcome <br /> Sri Vinayaka Collections</h2>
                    <p className="text-amber-100/80 text-sm">Secure login using mobile OTP</p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm flex items-center gap-2">
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Mobile Number</label>
                                <div className="group relative transition-all">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <div className="flex items-center gap-2 text-gray-400 group-focus-within:text-amber-600 transition-colors">
                                            <Phone size={18} />
                                            <span className="font-bold border-r pr-3 border-gray-200">+91</span>
                                        </div>
                                    </div>
                                    <input
                                        required
                                        type="tel"
                                        maxLength="10"
                                        autoFocus
                                        className="w-full pl-24 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none font-bold text-xl tracking-[0.1em] text-gray-800 placeholder:text-gray-300"
                                        placeholder="00000 00000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>
                                <p className="mt-3 text-[10px] text-gray-400 font-medium text-center uppercase tracking-wide">Secure 6-digit code will be sent via SMS</p>
                            </div>

                            <button
                                disabled={loading || phone.length < 10}
                                type="submit"
                                className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-amber-900/10 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-lg uppercase tracking-widest"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Request Code'}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </form>
                    ) : step === 2 ? (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Verification Code</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-amber-600 transition-colors">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <input
                                        required
                                        autoFocus
                                        type="text"
                                        maxLength="6"
                                        className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none font-mono text-center text-4xl tracking-[0.6em] text-gray-800"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>
                                <div className="mt-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                                        <span className="text-gray-400">Sent to +91 {phone}</span>
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="text-amber-600 hover:text-amber-700 underline"
                                        >
                                            Edit Number
                                        </button>
                                    </div>

                                    <div className="h-px bg-gray-100 w-full" />

                                    <div className="flex justify-center">
                                        {timer > 0 ? (
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                                                Resend available in <span className="text-amber-600">{timer}s</span>
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResendOTP}
                                                className="text-[11px] text-amber-600 font-black uppercase tracking-widest hover:text-amber-700 hover:scale-105 transition-all"
                                            >
                                                Resend OTP Code
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                disabled={loading || otp.length < 6}
                                type="submit"
                                className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-amber-900/10 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-lg uppercase tracking-widest"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Verify Account'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCompleteProfile} className="space-y-4">
                            <h3 className="text-center text-lg font-serif font-black text-amber-900 mb-4">Complete Your Profile</h3>

                            {/* Profile Image Upload */}
                            <div className="flex flex-col items-center mb-4">
                                <label className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden group relative hover:border-amber-500 transition-all">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400 group-hover:text-amber-500 transition-colors">
                                            <Camera size={24} />
                                            <span className="text-[10px] mt-1 font-bold">UPLOAD</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name Input */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Full Name *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><UserIcon size={16} /></div>
                                        <input required type="text" className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all outline-none text-sm" placeholder="Aarav Sharma" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Email Details *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail size={16} /></div>
                                        <input required type="email" className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all outline-none text-sm" placeholder="aarav@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>

                                {/* Age Input */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Age</label>
                                    <div className="relative">
                                        <input type="number" min="12" max="100" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all outline-none text-sm" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} />
                                    </div>
                                </div>

                                {/* Gender Select */}
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Gender</label>
                                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all outline-none text-sm" value={gender} onChange={(e) => setGender(e.target.value)}>
                                        <option value="" disabled>Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                disabled={loading || !name || !email}
                                type="submit"
                                className="w-full mt-4 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 text-lg"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Complete Sign In'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 text-center">
                    <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-tighter">
                        By signing in, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
