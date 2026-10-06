import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import API from '../api';
import { ShieldCheck, Lock, CreditCard, CheckCircle, Tag, Pencil, Store, Truck } from 'lucide-react';

const STORE_PICKUP_DETAILS = {
    name: 'Sri Vinayaka Collections',
    address: 'H.No 6-4-469/1, Krishna Nagar Colony, Beside Axis Bank Lane, Musheerabad',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500080',
    country: 'India',
    phone: '9392239145',
};

const RAPIDO_DEFAULT_CITY = 'Hyderabad';
const RAPIDO_SERVICE_CITIES = ['Hyderabad', 'Secunderabad'];

const CONFETTI_COLORS = ['#16a34a', '#f59e0b', '#ef4444', '#2563eb', '#db2777', '#7c3aed'];
const CONFETTI_PIECES = Array.from({ length: 34 }, (_, index) => ({
    color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    left: `${6 + ((index * 29) % 88)}%`,
    delay: `${(index % 8) * 0.08}s`,
    duration: `${1.25 + (index % 5) * 0.14}s`,
    size: 7 + (index % 5),
    rotation: index % 2 === 0 ? 220 : -220,
}));

const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(-1);
    const [taxConfig, setTaxConfig] = useState({ enabled: false, rate: 0, label: 'GST' });
    const [couponCode, setCouponCode] = useState('');
    const [couponData, setCouponData] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [couponOptions, setCouponOptions] = useState([]);
    const [couponOptionsOpen, setCouponOptionsOpen] = useState(false);
    const [couponOptionsLoading, setCouponOptionsLoading] = useState(false);
    const [shippingMethods, setShippingMethods] = useState([]);
    const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [fulfillmentMethod, setFulfillmentMethod] = useState('delivery');
    const [showPickupCelebration, setShowPickupCelebration] = useState(false);

    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: '',
        addressType: 'Home',
    });

    const [paymentMethod, setPaymentMethod] = useState('Online');
    const isHomeDelivery = fulfillmentMethod === 'delivery';
    const isRapidoDelivery = fulfillmentMethod === 'pickup';

    const isRapidoServiceCity = (city = '') => (
        RAPIDO_SERVICE_CITIES.some((serviceCity) => serviceCity.toLowerCase() === city.trim().toLowerCase())
    );

    const getRapidoCity = (city = '') => (
        isRapidoServiceCity(city) ? city : RAPIDO_DEFAULT_CITY
    );

    useEffect(() => {
        if (user) {
            API.get('/api/users/addresses')
                .then(res => {
                    setAddresses(res.data);
                    const defaultIdx = res.data.findIndex(a => a.isDefault);
                    if (defaultIdx !== -1) {
                        applySavedAddress(res.data[defaultIdx], defaultIdx);
                    }
                })
                .catch(err => console.error('Error fetching addresses', err));
        }
    }, [user]);

    useEffect(() => {
        API.get('/api/settings/tax_config').then(res => {
            if (res.data && res.data.value) {
                const v = res.data.value;
                setTaxConfig({ enabled: !!v.enabled, rate: Number(v.rate) || 0, label: v.label || 'GST' });
            }
        }).catch(() => { });

        API.get('/api/shipping').then(res => {
            const activeMethods = res.data.filter(m => m.isActive);
            setShippingMethods(activeMethods);
            if (activeMethods.length > 0) {
                setSelectedShippingMethod(activeMethods[0]);
            }
        }).catch(() => { });
    }, []);

    useEffect(() => {
        setCouponOptionsLoading(true);
        API.get('/api/coupons/public')
            .then((res) => {
                setCouponOptions(Array.isArray(res.data) ? res.data : []);
            })
            .catch((err) => {
                console.error('Error fetching coupons', err);
            })
            .finally(() => {
                setCouponOptionsLoading(false);
            });
    }, []);

    useEffect(() => {
        if (!showPickupCelebration) return undefined;
        const timer = window.setTimeout(() => setShowPickupCelebration(false), 2600);
        return () => window.clearTimeout(timer);
    }, [showPickupCelebration]);

    const selectRapidoDelivery = () => {
        setFulfillmentMethod('pickup');
        setIsEditing(false);
        setShippingAddress((prev) => ({
            ...prev,
            city: getRapidoCity(prev.city),
            state: prev.state || 'Telangana',
            country: prev.country || 'India',
        }));
        setShowPickupCelebration(true);
    };

    const taxAmount = taxConfig.enabled && taxConfig.rate > 0 ? Math.round(cartTotal * taxConfig.rate / 100) : 0;
    const mrpTotal = cartItems.reduce((sum, item) => {
        const mrp = Number(item.originalMrp || item.originalBasePrice || item.price || 0);
        return sum + (mrp * item.qty);
    }, 0);
    const salePriceTotal = cartTotal;
    const youSavedAmount = Math.max(0, mrpTotal - salePriceTotal);
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const discountAmount = (() => {
        if (!couponData) return 0;
        if (couponData.discountType === 'percent') return Math.min(Math.round(cartTotal * couponData.discountValue / 100), cartTotal);
        return Math.min(couponData.discountValue, cartTotal);
    })();
    const shippingRate = isHomeDelivery && selectedShippingMethod ? selectedShippingMethod.price : 0;
    const shippingPrice = shippingRate * totalQuantity;
    const totalPrice = Math.max(0, cartTotal + taxAmount + shippingPrice - discountAmount);

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponError('');
        setCouponLoading(true);
        try {
            const { data } = await API.post('/api/coupons/validate', {
                code: couponCode.trim().toUpperCase(),
                orderAmount: cartTotal,
                userId: user?._id,
            });
            setCouponData(data);
        } catch (err) {
            setCouponData(null);
            setCouponError(err.response?.data?.message || 'Invalid or inapplicable coupon');
        } finally {
            setCouponLoading(false);
        }
    };

    const handleSelectCoupon = async (code) => {
        setCouponCode(code);
        setCouponError('');
        setCouponOptionsOpen(false);
        setCouponLoading(true);
        try {
            const { data } = await API.post('/api/coupons/validate', {
                code: code.trim().toUpperCase(),
                orderAmount: cartTotal,
                userId: user?._id,
            });
            setCouponData(data);
        } catch (err) {
            setCouponData(null);
            setCouponError(err.response?.data?.message || 'Invalid or inapplicable coupon');
        } finally {
            setCouponLoading(false);
        }
    };

    const formatCouponLabel = (coupon) => {
        const value = Number(coupon?.discountValue || 0);
        return coupon?.discountType === 'percent' ? `${value}% OFF` : `₹${value} OFF`;
    };

    const applySavedAddress = (addr, idx) => {
        setSelectedIdx(idx);
        setIsEditing(false);
        setEditId(null);
        setShippingAddress({
            name: addr.name || '',
            address: addr.addressLine,
            city: isRapidoDelivery ? getRapidoCity(addr.city) : addr.city,
            state: isRapidoDelivery ? 'Telangana' : addr.state || '',
            postalCode: addr.zipCode,
            country: 'India',
            phone: addr.phone || '',
            addressType: addr.label || 'Home',
        });
    };

    const handleEditClick = (e, addr, idx) => {
        e.stopPropagation();
        setSelectedIdx(idx);
        setIsEditing(true);
        setEditId(addr._id);
        setShippingAddress({
            name: addr.name || '',
            address: addr.addressLine,
            city: isRapidoDelivery ? getRapidoCity(addr.city) : addr.city,
            state: isRapidoDelivery ? 'Telangana' : addr.state || '',
            postalCode: addr.zipCode,
            country: 'India',
            phone: addr.phone || '',
            addressType: addr.label || 'Home',
        });
    };

    const saveNewAddress = async () => {
        setLoading(true);
        try {
            await API.post('/api/users/addresses', {
                name: shippingAddress.name,
                addressLine: shippingAddress.address,
                city: shippingAddress.city,
                state: shippingAddress.state || 'Telangana',
                zipCode: shippingAddress.postalCode,
                phone: shippingAddress.phone,
                label: shippingAddress.addressType || 'Home',
                isDefault: addresses.length === 0,
            });

            const res = await API.get('/api/users/addresses');
            setAddresses(res.data);
            setIsEditing(false);
            // Select the newly added address (usually the last one or by ID)
            if (res.data.length > 0) {
                applySavedAddress(res.data[res.data.length - 1], res.data.length - 1);
            }
        } catch (err) {
            console.error('Error saving new address', err);
            alert(err.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const saveAddressChanges = async () => {
        if (!editId) return;
        setLoading(true);
        try {
            await API.put(`/api/users/addresses/${editId}`, {
                name: shippingAddress.name,
                addressLine: shippingAddress.address,
                city: shippingAddress.city,
                state: shippingAddress.state || 'Telangana',
                zipCode: shippingAddress.postalCode,
                phone: shippingAddress.phone,
                label: shippingAddress.addressType,
            });

            const res = await API.get('/api/users/addresses');
            setAddresses(res.data);
            setIsEditing(false);
            setEditId(null);
            alert('Address updated successfully!');
        } catch (err) {
            console.error('Error saving address', err);
            alert('Failed to update address');
        } finally {
            setLoading(false);
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAKHbbax8rKjSNi0jO_yOPY5zhnm93whcg`);
                    const data = await response.json();
                    if (data.status === 'OK' && data.results.length > 0) {
                        const components = data.results[0].address_components;
                        let streetNumber = '';
                        let route = '';
                        let sublocality = '';
                        let locality = '';
                        let state = '';
                        let postalCode = '';
                        components.forEach(c => {
                            if (c.types.includes('street_number')) streetNumber = c.long_name;
                            if (c.types.includes('route')) route = c.long_name;
                            if (c.types.includes('sublocality') || c.types.includes('sublocality_level_1')) sublocality = c.long_name;
                            if (c.types.includes('locality')) locality = c.long_name;
                            if (c.types.includes('administrative_area_level_1')) state = c.long_name;
                            if (c.types.includes('postal_code')) postalCode = c.long_name;
                        });
                        setShippingAddress(prev => ({
                            ...prev,
                            address: [streetNumber, route, sublocality].filter(Boolean).join(', ') || data.results[0].formatted_address,
                            city: isRapidoDelivery ? getRapidoCity(locality) : locality,
                            state: state || 'Telangana',
                            postalCode: postalCode,
                        }));
                    } else {
                        alert('Could not resolve location. Please enter manually.');
                    }
                } catch (err) {
                    console.error(err);
                    alert('Error fetching location details.');
                }
            },
            (error) => {
                alert('Permission denied or error getting location.');
            }
        );
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!user) {
            setIsLoginModalOpen(true);
            return;
        }

        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
            alert('Please select or add a delivery address before placing your order.');
            return;
        }

        if (isRapidoDelivery && !isRapidoServiceCity(shippingAddress.city)) {
            alert('Rapido delivery is available only in Hyderabad and Secunderabad.');
            return;
        }

        setLoading(true);

        try {
            const orderShippingAddress = shippingAddress;

            const orderData = {
                orderItems: cartItems,
                shippingAddress: orderShippingAddress,
                paymentMethod,
                itemsPrice: cartTotal,
                shippingPrice,
                shippingMethod: isHomeDelivery ? selectedShippingMethod?.name : 'Delivery By Rapido',
                taxPrice: taxAmount,
                totalPrice,
                ...(couponData && { couponCode: couponData.code, discountAmount }),
            };

            const { data } = await API.post('/api/orders', orderData);

            if (paymentMethod === 'Online') {
                try {
                    const payRes = await API.post('/api/orders/easebuzz/initiate', { orderId: data._id });
                    if (payRes.data.success) {
                        window.location.href = payRes.data.url;
                        return;
                    } else {
                        throw new Error('Payment initiation failed');
                    }
                } catch (payErr) {
                    console.error('Easebuzz error', payErr);
                    alert('Order placed but payment failed. ' + data._id);
                }
            }

            if (clearCart) clearCart();
            navigate(`/thank-you?orderId=${data._id}`);
        } catch (error) {
            console.error('Order failed', error);
            alert(error.response?.data?.message || 'Order failed to place.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Lock size={32} className="text-amber-900" />
                    </div>
                    <h2 className="text-2xl font-serif text-gray-900 mb-4">Secure Checkout</h2>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                        To protect your heritage selections and ensure accurate delivery, please sign in to your Sri Vinayaka account.
                    </p>
                    <button
                        onClick={() => setIsLoginModalOpen(true)}
                        className="w-full bg-amber-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl shadow-lg transition-all"
                    >
                        Sign In to Continue
                    </button>
                    <button
                        onClick={() => navigate('/cart')}
                        className="mt-6 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-amber-900 transition-colors"
                    >
                        Back to Shopping Bag
                    </button>
                </div>
                <LoginModal
                    isOpen={isLoginModalOpen}
                    onClose={() => setIsLoginModalOpen(false)}
                    onLoginSuccess={() => setIsLoginModalOpen(false)}
                />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-serif mb-4 text-gray-400">Your cart is empty</h2>
                <button onClick={() => navigate('/products')} className="bg-amber-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg">Discover Collections</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-24">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 lg:px-8">
                <h1 className="text-2xl font-serif text-gray-900 mb-8 flex items-center justify-between">
                    Secure Checkout
                    <span className="text-xs font-sans font-bold text-gray-400 uppercase tracking-widest text-[#999]">Safe & Secure Payment</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Column: Forms */}
                    <div className="flex-1 space-y-6 w-full">
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-8 flex items-center gap-3">
                                <span className="bg-amber-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Delivery Option
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFulfillmentMethod('delivery')}
                                    className={`p-5 rounded-3xl border-2 text-left transition-all ${isHomeDelivery ? 'border-amber-900 bg-amber-50 shadow-md' : 'border-gray-100 bg-white hover:border-amber-200'}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isHomeDelivery ? 'bg-amber-900 text-white' : 'bg-gray-50 text-gray-500'}`}>
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">Home Delivery</h3>
                                                <p className="mt-2 text-xs leading-relaxed text-gray-500">Ship this order to your selected address.</p>
                                            </div>
                                        </div>
                                        {isHomeDelivery && <CheckCircle size={18} className="text-amber-900 shrink-0" />}
                                    </div>
                                </button>
                                 <button
                                     type="button"
                                     onClick={selectRapidoDelivery}
                                     className={`p-5 rounded-3xl border-2 text-left transition-all ${!isHomeDelivery ? 'border-amber-900 bg-amber-50 shadow-md' : 'border-gray-100 bg-white hover:border-amber-200'}`}
                                 >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${!isHomeDelivery ? 'bg-amber-900 text-white' : 'bg-gray-50 text-gray-500'}`}>
                                                <Store size={20} />
                                            </div>
                                            <div>
                                                 <h3 className="font-bold text-gray-900">Delivery By Rapido</h3>
                                                 <p className="mt-2 text-xs leading-relaxed text-gray-500">Rapido will collect your order from the store and deliver it to your specified address.</p>
                                            </div>
                                        </div>
                                        {!isHomeDelivery && <CheckCircle size={18} className="text-amber-900 shrink-0" />}
                                    </div>
                                </button>
                            </div>
                        </section>

                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-8 flex items-center gap-3">
                                <span className="bg-amber-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Delivery Address
                            </h2>

                            {user && addresses.length > 0 ? (
                                <div className="mb-8 space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Saved Delivery Destinations</label>
                                        <button
                                            type="button"
                                            className="text-[10px] font-black uppercase tracking-widest text-amber-900 hover:text-black"
                                            onClick={() => {
                                                setSelectedIdx(-1);
                                                setIsEditing(true);
                                                setEditId(null);
                                                setShippingAddress({
                                                    name: '',
                                                    address: '',
                                                    city: isRapidoDelivery ? RAPIDO_DEFAULT_CITY : '',
                                                    state: isRapidoDelivery ? 'Telangana' : '',
                                                    postalCode: '',
                                                    country: 'India',
                                                    phone: '',
                                                    addressType: 'Home',
                                                });
                                            }}
                                        >
                                            Add New Destination
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr, idx) => (
                                            <div
                                                key={addr._id}
                                                onClick={() => applySavedAddress(addr, idx)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative group ${selectedIdx === idx ? 'border-amber-900 bg-amber-50 shadow-sm' : 'border-gray-100 bg-white hover:border-amber-200'}`}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-900/40">{addr.label}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleEditClick(e, addr, idx)}
                                                            className="text-gray-400 hover:text-amber-900 transition-colors p-1"
                                                        >
                                                            <Pencil size={12} />
                                                        </button>
                                                        {selectedIdx === idx && <div className="w-4 h-4 rounded-full bg-amber-900 flex items-center justify-center"><CheckCircle size={10} className="text-white" /></div>}
                                                    </div>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900">{addr.name}</p>
                                                <p className="text-[10px] text-gray-500 truncate">{addr.addressLine}, {addr.city}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                !isEditing && (
                                    <div
                                        onClick={() => {
                                            setIsEditing(true);
                                            if (isRapidoDelivery) {
                                                setShippingAddress((prev) => ({
                                                    ...prev,
                                                    city: getRapidoCity(prev.city),
                                                    state: prev.state || 'Telangana',
                                                    country: prev.country || 'India',
                                                }));
                                            }
                                        }}
                                        className="mb-8 border-2 border-dashed border-gray-100 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-amber-900 hover:bg-amber-50 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                                            <span className="text-2xl text-gray-400 group-hover:text-amber-900">+</span>
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">Add shipping address</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Required to place your order</p>
                                    </div>
                                )
                            )}

                            {isRapidoDelivery && (
                                <div className="mb-8 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-900">Rapido service area</p>
                                    <p className="mt-2 text-sm font-bold leading-relaxed text-gray-700">
                                        We are serving through Rapido only in Hyderabad and Secunderabad. Please enter your complete address; only the city is limited.
                                    </p>
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {RAPIDO_SERVICE_CITIES.map((city) => {
                                            const selected = shippingAddress.city.trim().toLowerCase() === city.toLowerCase();
                                            return (
                                                <button
                                                    key={city}
                                                    type="button"
                                                    onClick={() => setShippingAddress((prev) => ({ ...prev, city, state: prev.state || 'Telangana' }))}
                                                    className={`rounded-xl border px-4 py-3 text-xs font-black uppercase tracking-widest transition ${selected ? 'border-amber-900 bg-white text-amber-900 shadow-sm' : 'border-amber-200 bg-amber-50 text-gray-500 hover:bg-white'}`}
                                                >
                                                    {city}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {(selectedIdx === -1 || isEditing) && isEditing && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                    <div className="col-span-1 sm:col-span-2 mb-2 flex items-center justify-between">
                                        <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">{editId ? 'Editing Destination' : 'New Heritage Destination'}</p>
                                        <button type="button" onClick={() => { setIsEditing(false); setSelectedIdx(-1); }} className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest">CANCEL</button>
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                                        <input
                                            required
                                            className="w-full bg-white border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-sm"
                                            value={shippingAddress.name}
                                            onChange={(e) => { setShippingAddress({ ...shippingAddress, name: e.target.value }); }}
                                        />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Full Address</label>
                                            <button
                                                type="button"
                                                onClick={detectLocation}
                                                className="text-[10px] font-black text-amber-950 hover:text-amber-700 uppercase tracking-widest flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200"
                                            >
                                                📍 Auto-Detect Location
                                            </button>
                                        </div>
                                        <input
                                            required
                                            className="w-full bg-white border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-sm"
                                            value={shippingAddress.address}
                                            onChange={(e) => { setShippingAddress({ ...shippingAddress, address: e.target.value }); }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">City</label>
                                        {isRapidoDelivery ? (
                                            <select
                                                required
                                                className="w-full bg-white border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-sm"
                                                value={getRapidoCity(shippingAddress.city)}
                                                onChange={(e) => { setShippingAddress({ ...shippingAddress, city: e.target.value, state: shippingAddress.state || 'Telangana' }); }}
                                            >
                                                {RAPIDO_SERVICE_CITIES.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                required
                                                className="w-full bg-white border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-sm"
                                                value={shippingAddress.city}
                                                onChange={(e) => { setShippingAddress({ ...shippingAddress, city: e.target.value }); }}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">State</label>
                                        <input
                                            required
                                            className="w-full bg-white border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-sm"
                                            value={shippingAddress.state}
                                            placeholder="e.g. Telangana"
                                            onChange={(e) => { setShippingAddress({ ...shippingAddress, state: e.target.value }); }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Postal Code</label>
                                        <input
                                            required
                                            className="w-full bg-white border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-sm"
                                            value={shippingAddress.postalCode}
                                            onChange={(e) => { setShippingAddress({ ...shippingAddress, postalCode: e.target.value }); }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            maxLength={10}
                                            className="w-full bg-white border border-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium text-sm"
                                            value={shippingAddress.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) {
                                                    setShippingAddress({ ...shippingAddress, phone: val });
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Address Type</label>
                                        <div className="flex flex-wrap gap-3 sm:gap-4">
                                            {['Home', 'Office', 'Other'].map(type => (
                                                <label key={type} className={`cursor-pointer px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${shippingAddress.addressType === type ? 'bg-amber-900 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}>
                                                    <input type="radio" name="addressType" className="hidden" checked={shippingAddress.addressType === type} onChange={() => setShippingAddress({ ...shippingAddress, addressType: type })} />
                                                    {type}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-span-1 sm:col-span-2 pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={editId ? saveAddressChanges : saveNewAddress}
                                            className="w-full bg-amber-900 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-black transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Processing...' : (editId ? 'Apply Changes' : 'Confirm & Use Address')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>

                        {!isHomeDelivery && (
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-amber-100">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                                <span className="bg-amber-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                Rapido Pickup Origin (Store Details)
                            </h2>
                            <div className="rounded-3xl bg-amber-50 border border-amber-100 p-6 flex flex-col sm:flex-row gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-900 text-white flex items-center justify-center shrink-0">
                                    <Store size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Sri Vinayaka Collections</h3>
                                     <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                         Once your order is ready, Rapido will collect your order from our store and deliver it to your specified address.
                                     </p>
                                     <div className="mt-4 grid gap-3">
                                         <div className="rounded-2xl border border-amber-200 bg-white px-4 py-3">
                                             <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-900">
                                                 Store Details: {STORE_PICKUP_DETAILS.name}
                                             </p>
                                             <p className="mt-1 text-xs text-gray-600">
                                                 {STORE_PICKUP_DETAILS.address}, {STORE_PICKUP_DETAILS.city}, {STORE_PICKUP_DETAILS.state} - {STORE_PICKUP_DETAILS.postalCode}
                                             </p>
                                             <p className="mt-2 text-xs font-bold text-amber-900">Phone: {STORE_PICKUP_DETAILS.phone}</p>
                                         </div>
                                     </div>
                                     <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-amber-900">Rapido delivery is available only in Hyderabad and Secunderabad. Delivery charges are settled with the Rapido driver.</p>
                                </div>
                            </div>
                        </section>
                        )}

                        {isHomeDelivery && (
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-8 flex items-center gap-3">
                                <span className="bg-amber-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                Shipping Method
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {shippingMethods.map((method) => (
                                    <div
                                        key={method._id}
                                        onClick={() => setSelectedShippingMethod(method)}
                                        className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${selectedShippingMethod?._id === method._id ? 'border-amber-900 bg-amber-50 shadow-md' : 'border-gray-100 bg-white hover:border-amber-200'}`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-gray-900 leading-tight">{method.name}</h3>
                                                {selectedShippingMethod?._id === method._id && <CheckCircle size={16} className="text-amber-900" />}
                                            </div>
                                            <p className="text-[10px] text-gray-500 mb-4 font-light leading-relaxed truncate">{method.description}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/60 mb-1">{method.estimatedDays}</p>
                                            <p className="text-lg font-serif font-black text-amber-900">{method.price === 0 ? 'FREE' : `₹${method.price.toLocaleString()}`}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                        )}

                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
                                <span className="bg-amber-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{isHomeDelivery ? '4' : '3'}</span>
                                Coupon Code
                            </h2>
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    Select a coupon from the list or type one manually
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setCouponOptionsOpen((open) => !open)}
                                    className="border border-amber-900 text-amber-900 hover:bg-amber-50 font-bold py-2.5 px-4 rounded-xl uppercase tracking-widest text-[10px] transition"
                                >
                                    {couponOptionsOpen ? 'Hide Coupons' : 'View Coupons'}
                                </button>
                            </div>
                            {couponOptionsOpen && (
                                <div className="mb-4 border border-gray-100 rounded-2xl bg-gray-50 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Available Coupons</p>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-900">{couponOptions.length} offers</span>
                                    </div>
                                    {couponOptionsLoading ? (
                                        <p className="text-sm text-gray-500">Loading coupons...</p>
                                    ) : couponOptions.length === 0 ? (
                                        <p className="text-sm text-gray-500">No active coupons are available right now.</p>
                                    ) : (
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {couponOptions.map((coupon) => (
                                                <div key={coupon._id || coupon.code} className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-lg font-black text-gray-900">{coupon.code}</p>
                                                            <p className="text-xs font-bold uppercase tracking-widest text-amber-900 mt-1">{formatCouponLabel(coupon)}</p>
                                                            <p className="text-[10px] text-gray-500 mt-2">
                                                                {coupon.minOrderAmount > 0 ? `Min order ₹${Number(coupon.minOrderAmount).toLocaleString()}` : 'No minimum order'}
                                                            </p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSelectCoupon(coupon.code)}
                                                            className="shrink-0 rounded-full border border-amber-900 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-900 hover:bg-amber-900 hover:text-white transition"
                                                        >
                                                            Select
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex gap-3 flex-wrap items-end">
                                <div className="flex-1 min-w-[180px]">
                                    <input
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all font-medium uppercase tracking-wider"
                                        placeholder="Enter code"
                                        value={couponCode}
                                        onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                                    />
                                </div>
                                <button type="button" onClick={applyCoupon} disabled={couponLoading} className="bg-amber-900 hover:bg-amber-800 text-white font-bold py-3 px-6 rounded-xl uppercase tracking-widest text-xs transition disabled:opacity-60">
                                    {couponLoading ? 'Checking...' : 'Apply'}
                                </button>
                            </div>
                            {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
                            {couponData && (
                                <div className="mt-3 flex items-center justify-between bg-green-50 border border-green-100 p-3 rounded-xl">
                                    <span className="text-green-700 font-medium">✓ {couponData.code} applied</span>
                                    <button type="button" onClick={() => { setCouponData(null); setCouponCode(''); setCouponError(''); }} className="text-red-600 text-sm font-bold uppercase tracking-wider">Remove</button>
                                </div>
                            )}
                        </section>

                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-amber-900">
                                <span className="bg-amber-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{isHomeDelivery ? '5' : '4'}</span>
                                Payment Method
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center p-4 border-2 rounded-2xl border-amber-900 bg-amber-50">
                                    <div className="w-5 h-5 rounded-full border-2 border-amber-900 bg-amber-900 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                    <div className="ml-4 flex items-center gap-3">
                                        <CreditCard size={20} className="text-amber-900" />
                                        <span className="text-amber-900 font-bold uppercase tracking-widest text-[10px]">Secure Online Payment (UPI, Cards)</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-amber-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:opacity-50"
                        >
                            {loading ? 'Processing Ritual...' : 'Complete Purchase'}
                        </button>
                    </div>

                    {/* Right Column: Summary */}
                    <aside className="w-full lg:w-[400px] space-y-6 lg:sticky lg:top-32">
                        <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold mb-6 px-1">Order Review</h2>
                            <div className="space-y-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                                {cartItems.map(item => (
                                    <div key={item.product + item.variant?._id} className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-gray-900 mb-1">{item.name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Qty: {item.qty}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gray-50">
                                <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest">
                                    <span className="font-bold">Product Total (MRP)</span>
                                    <span>₹{mrpTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest">
                                    <span className="font-bold">Subtotal</span>
                                    <span>₹{salePriceTotal.toLocaleString()}</span>
                                </div>
                                {youSavedAmount > 0 && (
                                    <div className="flex justify-between items-center text-xs text-green-600 uppercase tracking-widest">
                                        <span className="font-bold"> Discount</span>
                                        <span>-₹{youSavedAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                {taxAmount > 0 && (
                                    <div className="flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest">
                                        <span className="font-bold">{taxConfig.label} ({taxConfig.rate}%)</span>
                                        <span>₹{taxAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xs text-green-600 uppercase tracking-widest">
                                    <span className="font-bold">{isHomeDelivery ? 'Delivery Fee' : 'Delivery By Rapido'}</span>
                                    <span>{isHomeDelivery ? (shippingPrice === 0 ? 'COMPLIMENTARY' : `₹${shippingPrice.toLocaleString()}`) : 'PAY DRIVER'}</span>
                                </div>

                                {!isHomeDelivery && (
                                    <div className="mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-100 animate-in fade-in zoom-in duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center">
                                                <Store size={10} className="text-amber-900" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-900">Rapido Selected</span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-900 leading-relaxed">
                                            We will use your complete delivery address. Rapido service is available only in Hyderabad and Secunderabad.
                                        </p>
                                    </div>
                                )}

                                {isHomeDelivery && selectedShippingMethod && (
                                    <div className="mt-4 bg-amber-50 rounded-2xl p-4 border border-amber-100 animate-in fade-in zoom-in duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center">
                                                <Tag size={10} className="text-amber-900" />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-900">Shipping Protocol</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Quantity</p>
                                                <p className="text-xs font-black text-gray-900">{totalQuantity} Units</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">State</p>
                                                <p className="text-xs font-black text-gray-900 truncate">{shippingAddress.state || 'India'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-amber-100">
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black text-amber-900 lowercase tracking-widest mb-1">Rate: <span className="text-base font-serif italic mr-1">₹{selectedShippingMethod.price}</span><span className="text-[10px]">/item</span></p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.3em]">{selectedShippingMethod.estimatedDays} Delivery</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-xs text-green-600 uppercase tracking-widest pt-2">
                                        <span className="font-bold">Coupon Savings</span>
                                        <span>-₹{discountAmount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-6 mt-4 border-t-2 border-gray-100 text-amber-900">
                                    <span className="text-xs font-black uppercase tracking-[0.3em]">Grand Total</span>
                                    <span className="text-2xl font-serif font-black italic">₹{totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4 pt-4 border-t border-gray-50">
                                <div className="flex items-center justify-center gap-6 opacity-40 grayscale">
                                    <ShieldCheck size={20} />
                                    <Lock size={20} />
                                </div>
                                <p className="text-[8px] text-gray-400 text-center font-bold uppercase tracking-[0.2em] leading-relaxed px-4">
                                    Your secure transaction is encrypted via 256-bit SSL protocol for absolute safety.
                                </p>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {showPickupCelebration && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
                    {CONFETTI_PIECES.map((piece, index) => (
                        <span
                            key={`pickup-confetti-${index}`}
                            className="pointer-events-none absolute top-[-80px] rounded-sm animate-[svcConfettiFall_var(--duration)_var(--delay)_ease-out_forwards]"
                            style={{
                                left: piece.left,
                                width: piece.size,
                                height: piece.size * 1.7,
                                backgroundColor: piece.color,
                                '--delay': piece.delay,
                                '--duration': piece.duration,
                                '--rotation': `${piece.rotation}deg`,
                            }}
                        />
                    ))}
                    <div className="relative z-10 w-full max-w-sm animate-[svcPopIn_220ms_ease-out_forwards] rounded-[2rem] border border-amber-100 bg-white p-7 text-center shadow-2xl">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-800">Rapido Delivery Selected</p>
                        <h2 className="mt-3 text-5xl font-black tracking-tight text-emerald-600">WOW!</h2>
                        <p className="mt-2 text-xl font-black text-gray-950">You saved delivery charges</p>
                        <p className="mt-4 text-xs font-bold leading-5 text-gray-500">
                            We are serving through Rapido only in Hyderabad and Secunderabad.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowPickupCelebration(false)}
                            className="mt-6 rounded-2xl bg-amber-950 px-7 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition hover:bg-black"
                        >
                            Awesome
                        </button>
                    </div>
                    <style>{`
                        @keyframes svcConfettiFall {
                            0% { opacity: 0; transform: translateY(0) rotate(0deg); }
                            12% { opacity: 1; }
                            82% { opacity: 1; }
                            100% { opacity: 0; transform: translateY(110vh) rotate(var(--rotation)); }
                        }
                        @keyframes svcPopIn {
                            0% { opacity: 0; transform: scale(0.92) translateY(8px); }
                            100% { opacity: 1; transform: scale(1) translateY(0); }
                        }
                    `}</style>
                </div>
            )}

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={() => setIsLoginModalOpen(false)}
            />
        </div>
    );
};

export default CheckoutPage;
