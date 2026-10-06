import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { Package, User, MapPin, LogOut, ChevronRight, Clock, CheckCircle, Truck, Camera, Loader2 } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/urls';

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

const Account = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressFormData, setAddressFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        addressLine: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false,
        label: 'Home'
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('history');
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        age: user?.age || '',
        gender: user?.gender || '',
        profileImage: user?.profileImage || ''
    });
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(user?.profileImage || '');
    const [updating, setUpdating] = useState(false);
    const [updateMsg, setUpdateMsg] = useState({ text: '', type: '' });

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setUpdateMsg({ text: '', type: '' });

        try {
            let uploadedImageUrl = profileData.profileImage;
            if (profileImageFile) {
                const formData = new FormData();
                formData.append('image', profileImageFile);
                const uploadRes = await API.post('/api/upload', formData);
                uploadedImageUrl = uploadRes.data;
            }

            const updatedData = {
                ...profileData,
                age: Number(profileData.age),
                ...(uploadedImageUrl && { profileImage: uploadedImageUrl })
            };

            const { data } = await API.put('/api/users/profile', updatedData);

            localStorage.setItem('saree_user', JSON.stringify(data));
            setUpdateMsg({ text: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            setUpdateMsg({ text: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await API.get('/api/orders/myorders');
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAddresses = async () => {
            try {
                const { data } = await API.get('/api/users/addresses');
                setAddresses(data);
            } catch (error) {
                console.error('Error fetching addresses', error);
            }
        };

        fetchOrders();
        fetchAddresses();
    }, [user, navigate]);

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setAddressLoading(true);
        try {
            if (editingAddress) {
                const { data } = await API.put(`/api/users/addresses/${editingAddress._id}`, addressFormData);
                setAddresses(data);
            } else {
                const { data } = await API.post('/api/users/addresses', addressFormData);
                setAddresses(data);
            }
            setIsAddressModalOpen(false);
            setEditingAddress(null);
            setAddressFormData({ name: user.name, phone: user.phone, addressLine: '', city: '', state: '', zipCode: '', isDefault: false, label: 'Home' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save address');
        } finally {
            setAddressLoading(false);
        }
    };

    const deleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to remove this address?')) return;
        try {
            const { data } = await API.delete(`/api/users/addresses/${id}`);
            setAddresses(data);
        } catch (err) {
            alert('Failed to delete address');
        }
    };

    const openAddressModal = (addr = null) => {
        if (addr) {
            setEditingAddress(addr);
            setAddressFormData({ ...addr });
        } else {
            setEditingAddress(null);
            setAddressFormData({ name: user.name, phone: user.phone, addressLine: '', city: '', state: '', zipCode: '', isDefault: false, label: 'Home' });
        }
        setIsAddressModalOpen(true);
    };

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="bg-[#FAF9F6] min-h-screen py-12 px-4 md:py-20">
            <div className="container mx-auto max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <span className="text-amber-600 font-black tracking-[0.4em] text-[10px] mb-4 block">Patron Profile</span>
                        <h1 className="text-3xl md:text-4xl font-serif text-gray-900">Welcome, <span className="italic">{user.name}</span></h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-black uppercase tracking-widest text-[10px] transition group"
                    >
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 italic text-gray-500 text-sm">
                            "The beauty of heritage lies in the stories we keep."
                        </div>
                        <nav className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`w-full flex items-center justify-between p-6 ${activeTab === 'history' ? 'text-amber-900 bg-amber-50 font-bold border-l-4 border-amber-900' : 'text-gray-600 hover:bg-gray-50 transition border-l-4 border-transparent hover:border-gray-200'}`}
                            >
                                <span className="flex items-center gap-4"><Package size={20} /> Order History</span>
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-full flex items-center justify-between p-6 ${activeTab === 'profile' ? 'text-amber-900 bg-amber-50 font-bold border-l-4 border-amber-900' : 'text-gray-600 hover:bg-gray-50 transition border-l-4 border-transparent hover:border-gray-200'}`}
                            >
                                <span className="flex items-center gap-4"><User size={20} /> Personal Details</span>
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`w-full flex items-center justify-between p-6 ${activeTab === 'addresses' ? 'text-amber-900 bg-amber-50 font-bold border-l-4 border-amber-900' : 'text-gray-600 hover:bg-gray-50 transition border-l-4 border-transparent hover:border-gray-200'}`}
                            >
                                <span className="flex items-center gap-4"><MapPin size={20} /> My Addresses</span>
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`w-full flex items-center justify-between p-6 ${activeTab === 'security' ? 'text-amber-900 bg-amber-50 font-bold border-l-4 border-amber-900' : 'text-gray-600 hover:bg-gray-50 transition border-l-4 border-transparent hover:border-gray-200'}`}
                            >
                                <span className="flex items-center gap-4"><CheckCircle size={20} /> Privacy & Security</span>
                                <ChevronRight size={16} />
                            </button>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3 space-y-6">
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                    <h2 className="text-xl font-serif text-gray-900">Personal Details</h2>
                                </div>
                                <div className="p-8">
                                    {updateMsg.text && (
                                        <div className={`mb-6 p-4 rounded-xl border-l-4 text-sm font-bold ${updateMsg.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                                            {updateMsg.text}
                                        </div>
                                    )}
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="flex flex-col items-center mb-8">
                                            <label className="w-32 h-32 rounded-full border-4 border-dashed border-amber-200 flex items-center justify-center bg-gray-50 cursor-pointer overflow-hidden group relative hover:border-amber-500 transition-all">
                                                {previewImage ? (
                                                    <img src={`${IMAGE_BASE_URL}${previewImage}`} onError={(e) => { e.target.onerror = null; e.target.src = previewImage }} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center text-amber-900/40 group-hover:text-amber-600 transition-colors">
                                                        <Camera size={32} />
                                                        <span className="text-xs mt-2 font-bold tracking-widest uppercase">Select</span>
                                                    </div>
                                                )}
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                                            </label>
                                            <p className="mt-4 text-xs font-bold tracking-widest uppercase text-gray-400">Update Profile Picture</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Full Name</label>
                                                <input required type="text" name="name" className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all outline-none font-medium text-gray-900" value={profileData.name} onChange={handleProfileChange} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email Address</label>
                                                <input type="email" name="email" className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all outline-none font-medium text-gray-900" value={profileData.email} onChange={handleProfileChange} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Age</label>
                                                <input type="number" name="age" className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all outline-none font-medium text-gray-900" value={profileData.age} onChange={handleProfileChange} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Gender</label>
                                                <select name="gender" className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all outline-none font-medium text-gray-900" value={profileData.gender} onChange={handleProfileChange}>
                                                    <option value="" disabled>Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phone Number</label>
                                                <input disabled type="text" className="w-full px-4 py-4 bg-gray-100 border border-gray-200 rounded-xl outline-none font-medium text-gray-400 cursor-not-allowed" value={user.phone} />
                                                <p className="text-[10px] text-gray-400 mt-2 font-bold">Phone number cannot be changed.</p>
                                            </div>
                                        </div>

                                        <button
                                            disabled={updating}
                                            type="submit"
                                            className="w-full bg-amber-900 hover:bg-black disabled:bg-amber-900/50 text-white font-black uppercase tracking-widest py-5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            {updating ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                    <h2 className="text-xl font-serif text-gray-900">My Addresses</h2>
                                    <button 
                                        onClick={() => openAddressModal()}
                                        className="bg-amber-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-950 transition shadow-lg active:scale-95"
                                    >
                                        Add New Address
                                    </button>
                                </div>

                                <div className="p-8">
                                    {addresses.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                            <p className="text-gray-400 italic">No addresses saved yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {addresses.map((addr) => (
                                                <div key={addr._id} className={`p-6 rounded-[2rem] border-2 transition-all ${addr.isDefault ? 'border-amber-900 bg-amber-50/20' : 'border-gray-100 bg-white hover:border-amber-200'}`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="bg-amber-900 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">{addr.label}</span>
                                                        {addr.isDefault && <span className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest italic">Default</span>}
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 mb-1">{addr.name}</h4>
                                                    <p className="text-sm text-gray-500 mb-4 font-medium italic">{addr.phone}</p>
                                                    <p className="text-xs text-gray-400 leading-relaxed font-light uppercase tracking-wider mb-6">
                                                        {addr.addressLine}, {addr.city}, <br /> {addr.state} - {addr.zipCode}
                                                    </p>
                                                    <div className="flex gap-4 pt-4 border-t border-gray-50">
                                                        <button onClick={() => openAddressModal(addr)} className="text-[10px] font-black uppercase tracking-widest text-amber-900 hover:underline">Edit</button>
                                                        <button onClick={() => deleteAddress(addr._id)} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition">Delete</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Address Modal */}
                                {isAddressModalOpen && (
                                    <div className="fixed inset-0 z-[1001] flex items-start justify-center overflow-y-auto px-4 pb-4 pt-20 sm:pt-8 bg-black/60 backdrop-blur-md">
                                        <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto animate-slide-up">
                                            <div className="bg-amber-950 p-8 text-white flex justify-between items-center">
                                                <h3 className="text-lg font-medium">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                                                <button onClick={() => setIsAddressModalOpen(false)} className="text-white/60 hover:text-white transition-colors">✕</button>
                                            </div>
                                            <form onSubmit={handleAddressSubmit} className="p-6 sm:p-10 space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recipient Name</label>
                                                        <input required className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium" value={addressFormData.name} onChange={e => setAddressFormData({...addressFormData, name: e.target.value})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                                                        <input required className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium" value={addressFormData.phone} onChange={e => setAddressFormData({...addressFormData, phone: e.target.value})} />
                                                    </div>
                                                    <div className="col-span-1 sm:col-span-2">
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Address Details (Area/Street)</label>
                                                        <textarea required className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium" value={addressFormData.addressLine} onChange={e => setAddressFormData({...addressFormData, addressLine: e.target.value})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">City</label>
                                                        <input required className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium" value={addressFormData.city} onChange={e => setAddressFormData({...addressFormData, city: e.target.value})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">State</label>
                                                        <input required className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium" value={addressFormData.state} onChange={e => setAddressFormData({...addressFormData, state: e.target.value})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Zip Code</label>
                                                        <input required className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium" value={addressFormData.zipCode} onChange={e => setAddressFormData({...addressFormData, zipCode: e.target.value})} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Label</label>
                                                        <select className="w-full bg-gray-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium" value={addressFormData.label} onChange={e => setAddressFormData({...addressFormData, label: e.target.value})}>
                                                            <option value="Home">Home</option>
                                                            <option value="Office">Office</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input type="checkbox" className="w-5 h-5 accent-amber-900 rounded-lg shadow-inner" checked={addressFormData.isDefault} onChange={e => setAddressFormData({...addressFormData, isDefault: e.target.checked})} />
                                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-amber-900 transition-colors">Set as Primary Address</span>
                                                </label>
                                                <button 
                                                    disabled={addressLoading}
                                                    type="submit" 
                                                    className="w-full bg-amber-900 hover:bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[12px] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                                                >
                                                    {addressLoading ? <Loader2 className="animate-spin" /> : (editingAddress ? 'Update Heritage Destination' : 'Save New Address')}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'history' && (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                    <h2 className="text-xl font-serif text-gray-900">Recent Collections Ordered</h2>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{orders.length} Orders</span>
                                </div>

                                {loading ? (
                                    <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                                        Loading your archive...
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="p-20 text-center">
                                        <p className="text-gray-500 mb-8 italic">You haven't added any heritage pieces to your collection yet.</p>
                                        <button onClick={() => navigate('/products')} className="bg-amber-900 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-black transition shadow-xl">
                                            Start Your Legacy
                                        </button>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {orders.map((order) => (
                                            <div key={order._id} className="p-8 hover:bg-gray-50 transition-colors group">
                                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-4 bg-amber-50 rounded-2xl text-amber-700">
                                                            <Package size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Order ID: {order._id.substring(18).toUpperCase()}</p>
                                                            <p className="font-bold text-gray-900">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-8">
                                                        <div className="flex flex-col items-center gap-1">
                                                            {order.isDelivered ? (
                                                                <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest py-2 px-4 bg-green-50 rounded-full">
                                                                    <CheckCircle size={12} /> Delivered
                                                                </span>
                                                            ) : !order.isPaid && order.paymentMethod === 'Online' ? (
                                                                <div className="flex flex-col items-end gap-1">
                                                                    <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-full ${
                                                                        order.paymentResult?.status === 'userCancelled' 
                                                                            ? 'bg-orange-50 text-orange-600' 
                                                                            : order.paymentResult?.status === 'failure' 
                                                                                ? 'bg-red-50 text-red-600'
                                                                                : 'bg-amber-50 text-amber-600'
                                                                    }`}>
                                                                        {order.paymentResult?.status === 'userCancelled' ? 'Cancelled by User' : 
                                                                         order.paymentResult?.status === 'failure' ? 'Payment Failed' : 
                                                                         'Payment Pending'}
                                                                    </span>
                                                                    {order.paymentResult?.status_message && 
                                                                        !['NA', 'NULL', 'UNDEFINED', ''].includes(String(order.paymentResult.status_message).toUpperCase().trim()) && (
                                                                        <span className="text-[9px] text-gray-400 font-medium truncate max-w-[150px]" title={order.paymentResult.status_message}>
                                                                            {order.paymentResult.status_message}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 uppercase tracking-widest py-2 px-4 bg-amber-50 rounded-full">
                                                                    <Truck size={12} className="animate-bounce" /> {normalizeOrderStatus(order.orderStatus)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex -space-x-4 overflow-hidden">
                                                    {order.orderItems.map((item, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={item.image || `${IMAGE_BASE_URL}/uploads/banarasi.png`}
                                                            alt={item.name}
                                                            className="w-16 h-20 object-cover rounded-xl border-4 border-white shadow-sm hover:z-10 transition-transform group-hover:translate-x-1"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'security' && (
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                    <h2 className="text-xl font-serif text-gray-900">Privacy & Security</h2>
                                </div>
                                <div className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-8 border border-gray-100 rounded-3xl space-y-4">
                                            <h3 className="text-lg font-serif italic">Your Data Manifesto</h3>
                                            <p className="text-sm text-gray-400 italic font-light leading-relaxed">We protect your heritage archive with global security standards. Your journey with us is private and secured.</p>
                                            <button onClick={() => navigate('/privacy-policy')} className="text-amber-900 font-black uppercase tracking-widest text-[10px] border-b border-amber-900/20 hover:border-amber-900 transition-all">Read Privacy Policy</button>
                                        </div>
                                        <div className="p-8 border border-red-50 rounded-3xl space-y-4 bg-red-50/10">
                                            <h3 className="text-lg font-serif italic text-red-900">Final Partition</h3>
                                            <p className="text-sm text-gray-400 italic font-light leading-relaxed">Should you wish to redact your presence from our archives permanently, you may initiate account deletion here.</p>
                                            <button onClick={() => navigate('/delete-account')} className="text-red-700 font-black uppercase tracking-widest text-[10px] border-b border-red-700/20 hover:border-red-700 transition-all">Delete Account</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Account;
