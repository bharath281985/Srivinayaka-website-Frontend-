import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Star,
    ShieldCheck,
    Truck,
    RefreshCcw,
    Instagram,
    Facebook,
    Twitter,
    ChevronRight,
    MapPin,
    Flower2,
    Palette,
    Wind,
    ShoppingBag,
    Apple,
    Play,
    Heart,
    Award,
    CheckCircle
} from 'lucide-react';
import API from '../api';
import { IMAGE_BASE_URL, getUploadUrl, getImageDisplayUrl } from '../config/urls';

const toTitleCase = (str) => (str && typeof str === 'string') ? str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : str;

const DEFAULT_HERO_IMAGE = 'https://backendapis.srivinayakacollections.com/uploads/pure_silk.png';
const DEFAULT_HERO_SIDE_IMAGE = 'https://backendapis.srivinayakacollections.com/uploads/chanderi.png';

const Home = () => {
    const [bestsellers, setBestsellers] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [festiveProducts, setFestiveProducts] = useState([]);
    const [weekendSaleProducts, setWeekendSaleProducts] = useState([]);
    const [regularProducts, setRegularProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brandValues, setBrandValues] = useState([]);
    const [atelier, setAtelier] = useState(null);
    const [appPromo, setAppPromo] = useState(null);
    const [social, setSocial] = useState(null);
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const scrollContainerRef = useRef(null);
    const categoryScrollRef = useRef(null);
    const topCategoryScrollRef = useRef(null);
    const [activeBannerIndex, setActiveBannerIndex] = useState(0);
    const [currentAppImageIndex, setCurrentAppImageIndex] = useState(0);
    const [heroSideImageIndex, setHeroSideImageIndex] = useState(0);

    // Auto-change app mockup images
    useEffect(() => {
        if (!appPromo?.mockupImages?.length) return;
        const interval = setInterval(() => {
            setCurrentAppImageIndex((prev) => (prev + 1) % appPromo.mockupImages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [appPromo?.mockupImages]);

    const heroBannersList = React.useMemo(() => {
        if (Array.isArray(banners) && banners.filter(b => b.isActive).length > 0) {
            return [...banners.filter(b => b.isActive)].sort((a, b) => (a.position || 0) - (b.position || 0));
        }
        return [{ imageUrl: DEFAULT_HERO_IMAGE, title: 'The Eternal Heritage Collection', subtitle: 'Curated Heritage', linkUrl: '/products' }];
    }, [banners]);

    const heroBanner = heroBannersList[activeBannerIndex] ?? heroBannersList[0];

    // Auto-change hero side images
    useEffect(() => {
        const currentBanner = heroBannersList?.[activeBannerIndex];
        if (!currentBanner?.sideImageUrls?.length) {
            setHeroSideImageIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setHeroSideImageIndex((prev) => (prev + 1) % currentBanner.sideImageUrls.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [activeBannerIndex, heroBannersList]);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const [bestRes, newRes, trendRes, festRes, weekRes, regRes, bannerRes, catRes, brandRes, atelierRes, appPromoRes, socialRes, setRes] = await Promise.all([
                    API.get('/api/products?bestSeller=true&limit=8'),
                    API.get('/api/products?newArrival=true&limit=8'),
                    API.get('/api/products?trending=true&limit=8'),
                    API.get('/api/products?featured=true&limit=8'),
                    API.get('/api/products?weekendSale=true&limit=8'),
                    API.get('/api/products?regularCollection=true&limit=8'),
                    API.get('/api/banners'),
                    API.get('/api/categories/home'),
                    API.get('/api/brand-values'),
                    API.get('/api/cms/atelier'),
                    API.get('/api/cms/app-promo'),
                    API.get('/api/cms/instagram'),
                    API.get('/api/settings/general')
                ]);
                setBestsellers(bestRes.data.products || bestRes.data);
                setNewArrivals(newRes.data.products || newRes.data);
                setTrendingProducts(trendRes.data.products || trendRes.data);
                setFestiveProducts(festRes.data.products || festRes.data);
                setWeekendSaleProducts(weekRes.data.products || weekRes.data);
                setRegularProducts(regRes.data.products || regRes.data);
                setBanners(Array.isArray(bannerRes.data) ? bannerRes.data : []);
                setBrandValues(brandRes.data.filter(v => v.isActive));
                setAtelier(atelierRes.data);
                setAppPromo(appPromoRes.data);
                setSocial(socialRes.data);
                if (setRes.data && setRes.data.value) setSettings(setRes.data.value);
                setCategories(catRes.data);
            } catch (error) {
                console.error('Error fetching home data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHomeData();
    }, []);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        const scrollElements = document.querySelectorAll('.reveal-on-scroll');
        scrollElements.forEach(el => observer.observe(el));

        return () => scrollElements.forEach(el => observer.unobserve(el));
    }, [loading]);

    // Auto-scroll logic for Categories, Price Ranges, and Trending Products
    useEffect(() => {
        const scroll = () => {
            if (categoryScrollRef.current && categories.length > 0) {
                const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
                if (scrollWidth <= clientWidth) return;

                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    categoryScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    categoryScrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
                }
            }

            if (topCategoryScrollRef.current) {
                // Removed JS auto-scroll as we now use CSS marquee for price bar
            }

            if (scrollContainerRef.current && trendingProducts.length > 0) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                if (scrollWidth <= clientWidth) return;

                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' });
                }
            }
        };

        const interval = setInterval(scroll, 8000);
        return () => clearInterval(interval);
    }, [categories, trendingProducts, loading]);

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        try {
            await API.post('/api/newsletter/subscribe', { email: newsletterEmail });
            setIsSubscribed(true);
            setNewsletterEmail('');
            setTimeout(() => setIsSubscribed(false), 5000); // Reset after 5s
        } catch (error) {
            alert(error.response?.data?.message || 'Subscription failed');
        }
    };


    useEffect(() => {
        // if (heroBannersList.length <= 1) return;
        // const t = setInterval(() => setActiveBannerIndex((i) => (i + 1) % heroBannersList.length), 5000);
        // return () => clearInterval(t);
    }, [heroBannersList.length]);

    const promoBanners = banners.filter(b => b.position > 1 && b.isActive).slice(0, 2);

    const valueIcons = {
        ShieldCheck: <ShieldCheck className="text-[#A67C3D]" size={32} />,
        Wind: <Wind className="text-[#A67C3D]" size={32} />,
        Truck: <Truck className="text-[#A67C3D]" size={32} />,
        RefreshCcw: <RefreshCcw className="text-[#A67C3D]" size={32} />,
        Star: <Star className="text-[#A67C3D]" size={32} />,
        Heart: <Heart className="text-[#A67C3D]" size={32} />,
        Award: <Award className="text-[#A67C3D]" size={32} />,
        CheckCircle: <CheckCircle className="text-[#A67C3D]" size={32} />
    };

    const priceRanges = [
        { label: 'Below ₹499', range: '-499' },
        { label: 'Below ₹799', range: '-799' },
        { label: 'Below ₹999', range: '-999' },
        { label: 'Below ₹1,499', range: '-1499' },
        { label: 'Below ₹1,999', range: '-1999' },
        { label: 'Below ₹2,499', range: '-2499' },
        { label: 'Below ₹2,999', range: '-2999' },
        { label: 'Below ₹3,499', range: '-3499' },
        { label: 'Below ₹3,999', range: '-3999' },
        { label: 'Below ₹4,999', range: '-4999' },
        { label: 'Below ₹9,999', range: '-9999' },
    ];

    return (
        <div className="bg-[#FCFAF7] overflow-x-hidden">
            {/* Top Price Filter Scroll Bar (Replacing Ticker) */}
            <div className="bg-[#2D241E] text-[#DBB37C] py-4 border-b border-[#EADECB]/10 relative z-50 overflow-x-auto no-scrollbar group">
                <div className="flex items-center justify-center gap-3 px-4 mx-auto">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] whitespace-nowrap text-white">
                        ✦ Shop by Price ✦
                    </span>
                    {priceRanges.map((pr, idx) => {
                        const [start, value] = pr.label.split('₹');
                        return (
                            <Link
                                key={idx}
                                to={`/products?priceRange=${pr.range}`}
                                className="flex items-center min-w-fit group/item cursor-pointer"
                            >
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#DBB37C] group-hover/item:text-white transition-all duration-300 whitespace-nowrap">
                                    {start} <span className="text-[13px] text-white bg-white/10 px-2 py-1 rounded ml-1">₹{value}</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative h-[calc(100vh-175px)] min-h-[500px] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0 bg-[#EADECB]">
                    {!loading && heroBannersList.map((b, i) => (
                        <div
                            key={b._id || i}
                            className={`absolute inset-0 transition-opacity duration-1000 ${i === activeBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
                        >
                            <img
                                src={getUploadUrl(b.imageUrl) || DEFAULT_HERO_IMAGE}
                                alt={b.title || 'Hero'}
                                className="w-full h-full object-cover object-top"
                                onError={(e) => {
                                    const img = e.target;
                                    if (img.dataset.fallbackUsed) return;
                                    img.dataset.fallbackUsed = '1';
                                    img.onerror = null;
                                    img.src = DEFAULT_HERO_IMAGE;
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                        </div>
                    ))}
                    {loading && (
                        <div className="absolute inset-0 bg-[#EADECB] flex items-center justify-center">
                            <div className="w-20 h-20 border-4 border-[#DBB37C]/20 border-t-[#DBB37C] rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="container mx-auto px-6 relative z-10 pt-20 md:pt-0">
                    <div className="grid lg:grid-cols-2 items-center gap-12 lg:gap-20">
                        <div className="max-w-3xl md:pl-12">
                            <span className="inline-block text-[#DBB37C] font-black text-[9px] uppercase tracking-[0.4em] mb-4 animate-fade-up">
                                {heroBanner.subtitle || 'Curated Heritage'}
                            </span>
                            <h1 className="text-[24px] md:text-[42px] font-serif text-white leading-[1.1] md:leading-[1.1] mb-6 animate-fade-up [animation-delay:200ms]">
                                {heroBanner.title?.includes(' – ') ? (
                                    <>
                                        {heroBanner.title.split(' – ')[0]} – <br className="hidden md:block" />
                                        {heroBanner.title.split(' – ')[1]}
                                    </>
                                ) : (
                                    heroBanner.title
                                )}
                            </h1>
                            <p className="text-[10px] md:text-[16px] text-white/70 mb-10 max-w-xl leading-relaxed animate-fade-up [animation-delay:400ms]">
                                {heroBanner.description || 'Ancient techniques met by modern consciousness. Discover heirlooms that transcend generations, woven by the master artisans of India.'}
                            </p>
                            <div className="flex flex-wrap gap-5 animate-fade-up [animation-delay:600ms]">
                                <a
                                    href={heroBanner.secondaryBtnLink || settings.iosLink || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-black text-white px-7 py-3 rounded-2xl flex items-center gap-4 border border-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl group min-w-[210px]"
                                >
                                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 transition-colors">
                                        <Apple size={32} fill="white" className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex flex-col items-start leading-[1.1]">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">Download on the</span>
                                        <p className="text-xl font-bold text-white tracking-tight">App Store</p>
                                    </div>
                                </a>
                                <a
                                    href={heroBanner.linkUrl || settings.androidLink || "#"}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-black text-white px-7 py-3 rounded-2xl flex items-center gap-4 border border-white/10 hover:border-white/30 transition-all duration-500 shadow-2xl group min-w-[210px]"
                                >
                                    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 transition-colors">
                                        <Play size={28} fill="#DBB37C" stroke="none" className="group-hover:scale-110 transition-transform ml-1" />
                                    </div>
                                    <div className="flex flex-col items-start leading-[1.1]">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">Get it on</span>
                                        <p className="text-xl font-bold text-white tracking-tight">Google Play</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="hidden lg:block relative animate-fade-up [animation-delay:800ms] ml-auto">
                            {!loading && (
                                //        <div className="relative z-10 rounded-[2.5rem] overflow-hidden border-[8px] border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 aspect-[2/3.5] w-[320px] ml-auto mr-12 bg-[#333]">
                                <div className="relative z-10 rounded-[2.5rem] overflow-hidden border-[5px] border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 aspect-[4/6] w-[320px] ml-auto mr-29 bg-[#333]">
                                    {(heroBanner.sideImageUrls && Array.isArray(heroBanner.sideImageUrls) && heroBanner.sideImageUrls.length > 0) ? (
                                        heroBanner.sideImageUrls.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={getUploadUrl(img)}
                                                className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-[1500ms] ease-in-out ${idx === heroSideImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                                                alt={`floating-${idx}`}
                                                onError={(e) => {
                                                    const target = e.target;
                                                    if (target.dataset.triedFallback) return;
                                                    target.dataset.triedFallback = '1';
                                                    target.src = DEFAULT_HERO_SIDE_IMAGE;
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <img
                                            src={getUploadUrl(heroBanner.sideImageUrl) || DEFAULT_HERO_SIDE_IMAGE}
                                            alt="Saree Craftsmanship"
                                            className="w-full h-full object-cover object-top scale-110 hover:scale-100 transition-transform duration-1000"
                                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_HERO_SIDE_IMAGE; }}
                                        />
                                    )}
                                </div>
                            )}
                            {loading && (
                                <div className="relative z-10 rounded-[2.5rem] bg-white/5 border-[8px] border-white/10 aspect-[4/5] max-w-sm ml-auto mr-12 animate-pulse"></div>
                            )}
                            {/* Decorative elements behind image */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/3 -translate-y-1/2 w-[110%] h-[110%] border border-[#DBB37C]/20 rounded-full -z-0" />
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#DBB37C]/10 rounded-full blur-3xl" />
                        </div>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute bottom-12 right-12 z-20 text-white/30 hidden lg:block animate-float">
                    <Flower2 size={120} strokeWidth={0.5} />
                </div>
            </section>


            {/* Shop by Fabric Grid (Enhanced) */}
            < section className="py-12 bg-[#FCFAF7]" >
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6 reveal-on-scroll">
                        <div className="max-w-xl">
                            <h2 className="text-[46px] font-serif text-[#2D241E] mb-4 tracking-tighter">Premium <span className="text-[#A67C3D]">Categories</span></h2>
                            <p className="text-gray-500 font-medium">Navigating the spectrum of Indian craftsmanship by texture and tradition.</p>
                        </div>
                        <Link to="/products" className="bg-[#2D241E] text-white px-10 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:scale-110 transition shadow-xl">View All</Link>
                    </div>

                    <div
                        ref={categoryScrollRef}
                        className="hidden md:flex overflow-x-auto gap-10 h-[620px] mb-12 no-scrollbar snap-x pb-10"
                    >
                        {categories.map((cat, idx) => (
                            <Link
                                to={`/products?category=${cat.slug}`}
                                key={cat._id}
                                className={`reveal-on-scroll reveal-from-right shrink-0 w-[260px] md:w-[220px] relative rounded-[2rem] overflow-hidden group perspective-1000 shadow-xl snap-center [transition-delay:${idx * 150}ms] ${idx % 2 === 0 ? 'mt-10 h-[calc(100%-2.5rem)]' : 'mb-10 h-[calc(100%-2.5rem)]'}`}
                            >
                                <img
                                    src={cat.image || `${IMAGE_BASE_URL}/uploads/modern_banarasi.png`}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-125 transition-transform duration-[2s]"
                                    alt={cat.name}
                                    onError={(e) => { e.target.src = `${IMAGE_BASE_URL}/uploads/banarasi.png`; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#2D241E]/90 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute bottom-6 left-6 right-6 transform group-hover:-translate-y-2 transition-transform duration-500">
                                    <h3 className="text-white font-serif text-xl mb-1">{cat.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Categories Scroll */}
                    <div className="flex md:hidden overflow-x-auto gap-4 pb-12 snap-x no-scrollbar">
                        {categories.map((cat) => (
                            <Link to={`/products?category=${cat.slug}`} key={cat._id} className="reveal-on-scroll min-w-[280px] snap-center aspect-[4/5] relative rounded-[2rem] overflow-hidden shadow-xl">
                                <img
                                    src={cat.image || `${IMAGE_BASE_URL}/uploads/pure_silk.png`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    alt={cat.name}
                                    onError={(e) => { e.target.src = `${IMAGE_BASE_URL}/uploads/chanderi.png`; }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                                    <h3 className="text-white font-serif text-2xl mb-1">{cat.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section >

            {/* 1. New Arrivals Section */}
            {newArrivals.length > 0 && (
                <section className="py-12 bg-white reveal-on-scroll">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
                            <div>
                                <span className="text-[#A67C3D] font-black tracking-[0.4em] text-[10px] mb-4 block uppercase whitespace-nowrap">Latest Hits</span>
                                <h2 className="text-[46px] md:text-[70px] font-serif text-[#2D241E] tracking-tighter">New <span className="text-[#A67C3D]">Arrivals</span></h2>
                            </div>
                            <Link to="/products?newArrival=true" className="text-xs font-black uppercase tracking-widest text-[#A67C3D] hover:underline mb-4">View All</Link>
                        </div>
                        <div className="flex gap-10 overflow-x-auto pb-12 snap-x no-scrollbar">
                            {newArrivals.map((product) => (
                                <Link to={`/product/${product.slug || product._id}`} key={product._id} className="w-[320px] shrink-0 snap-center group">
                                    <div className="relative aspect-[3/4.5] overflow-hidden rounded-[2.5rem] mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500 bg-white">
                                        <img src={product.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={product.name} />
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#2D241E] text-white text-[12px] font-black px-8 py-3 rounded-full uppercase tracking-widest shadow-xl whitespace-nowrap z-20">New</div>
                                    </div>
                                    <h3 className="font-serif text-xl text-[#2D241E] truncate mb-2">{product.name}</h3>
                                    <span className="text-2xl font-bold text-[#2D241E]">₹{product.basePrice.toLocaleString('en-IN')}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 2. Weekend Sale Section */}
            {weekendSaleProducts.length > 0 && (
                <section className="py-12 bg-[#FCFAF7] reveal-on-scroll">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
                            <div>
                                <span className="text-red-500 font-black tracking-[0.4em] text-[10px] mb-4 block uppercase whitespace-nowrap">Limited Time</span>
                                <h2 className="text-[46px] md:text-[70px] font-serif text-[#2D241E] tracking-tighter">Weekend <span className="text-red-600">Sale</span></h2>
                            </div>
                            <Link to="/products?weekendSale=true" className="text-xs font-black uppercase tracking-widest text-[#A67C3D] hover:underline mb-4">View All</Link>
                        </div>
                        <div className="flex gap-10 overflow-x-auto pb-12 snap-x no-scrollbar">
                            {weekendSaleProducts.map((product) => (
                                <Link to={`/product/${product.slug || product._id}`} key={product._id} className="w-[320px] shrink-0 snap-center group">
                                    <div className="relative aspect-[3/4.5] overflow-hidden rounded-[2.5rem] mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500 bg-white">
                                        <img src={product.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={product.name} />
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[12px] font-black px-8 py-3 rounded-full uppercase tracking-widest shadow-xl whitespace-nowrap z-20">Sale</div>
                                    </div>
                                    <h3 className="font-serif text-xl text-[#2D241E] truncate mb-2">{product.name}</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-bold text-[#2D241E]">₹{product.basePrice.toLocaleString('en-IN')}</span>
                                        {product.discountPrice > product.basePrice && <span className="text-sm line-through text-gray-400">₹{product.discountPrice.toLocaleString('en-IN')}</span>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 3. Regular Collections Section */}
            {regularProducts.length > 0 && (
                <section className="py-12 bg-white reveal-on-scroll">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
                            <div>
                                <span className="text-[#A67C3D] font-black tracking-[0.4em] text-[10px] mb-4 block uppercase whitespace-nowrap">Daily Heritage</span>
                                <h2 className="text-[46px] md:text-[70px] font-serif text-[#2D241E] tracking-tighter">Regular <span className="text-[#A67C3D]">Collections</span></h2>
                            </div>
                            <Link to="/products?regularCollection=true" className="text-xs font-black uppercase tracking-widest text-[#A67C3D] hover:underline mb-4">View All</Link>
                        </div>
                        <div className="flex gap-10 overflow-x-auto pb-12 snap-x no-scrollbar">
                            {regularProducts.map((product) => (
                                <Link to={`/product/${product.slug || product._id}`} key={product._id} className="w-[320px] shrink-0 snap-center group">
                                    <div className="relative aspect-[3/4.5] overflow-hidden rounded-[2.5rem] mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500 bg-white">
                                        <img src={product.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={product.name} />
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-600 text-white text-[12px] font-black px-8 py-3 rounded-full uppercase tracking-widest shadow-xl whitespace-nowrap z-20">Regular</div>
                                    </div>
                                    <h3 className="font-serif text-xl text-[#2D241E] truncate mb-2">{product.name}</h3>
                                    <span className="text-2xl font-bold text-[#2D241E]">₹{product.basePrice.toLocaleString('en-IN')}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. Trending Section */}
            {trendingProducts.length > 0 && (
                <section className="py-12 bg-[#FCFAF7] reveal-on-scroll">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
                            <div>
                                <span className="text-[#A67C3D] font-black tracking-[0.4em] text-[10px] mb-4 block uppercase whitespace-nowrap">What's Hot</span>
                                <h2 className="text-[46px] md:text-[70px] font-serif text-[#2D241E] tracking-tighter">Trending <span className="text-[#A67C3D]">Now</span></h2>
                            </div>
                            <Link to="/products?trending=true" className="text-xs font-black uppercase tracking-widest text-[#A67C3D] hover:underline mb-4">View All</Link>
                        </div>
                        <div className="flex gap-10 overflow-x-auto pb-12 snap-x no-scrollbar">
                            {trendingProducts.map((product) => (
                                <Link to={`/product/${product.slug || product._id}`} key={product._id} className="w-[320px] shrink-0 snap-center group">
                                    <div className="relative aspect-[3/4.5] overflow-hidden rounded-[2.5rem] mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500 bg-white">
                                        <img src={product.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={product.name} />
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[12px] font-black px-8 py-3 rounded-full uppercase tracking-widest shadow-xl whitespace-nowrap z-20">Trending</div>
                                    </div>
                                    <h3 className="font-serif text-xl text-[#2D241E] truncate mb-2">{product.name}</h3>
                                    <span className="text-2xl font-bold text-[#2D241E]">₹{product.basePrice.toLocaleString('en-IN')}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Best Seller (Sri Vinayaka Favourite) Section */}
            {bestsellers.length > 0 && (
                <section className="py-12 bg-white reveal-on-scroll">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
                            <div>
                                <span className="text-[#A67C3D] font-black tracking-[0.4em] text-[10px] mb-4 block uppercase whitespace-nowrap">Sri Vinayaka Favorites</span>
                                <h2 className="text-[46px] md:text-[70px] font-serif text-[#2D241E] tracking-tighter">Sri Vinayaka <span className="text-[#A67C3D]">Favourite</span></h2>
                            </div>
                            <Link to="/products?bestSeller=true" className="text-xs font-black uppercase tracking-widest text-[#A67C3D] hover:underline mb-4">View All</Link>
                        </div>
                        <div className="flex gap-10 overflow-x-auto pb-12 snap-x no-scrollbar">
                            {bestsellers.map((product) => (
                                <Link to={`/product/${product.slug || product._id}`} key={product._id} className="w-[320px] shrink-0 snap-center group">
                                    <div className="relative aspect-[3/4.5] overflow-hidden rounded-[2.5rem] mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500 bg-white">
                                        <img src={product.images?.[0] || `${IMAGE_BASE_URL}/uploads/cotton_silk.png`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={product.name} />
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#2D241E] text-white text-[12px] font-black px-8 py-3 rounded-full uppercase tracking-widest shadow-xl whitespace-nowrap z-20">Bestseller</div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <span className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">View Details</span>
                                        </div>
                                    </div>
                                    <h3 className="font-serif text-xl text-[#2D241E] truncate mb-2">{product.name}</h3>
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-bold text-[#2D241E]">₹{product.basePrice.toLocaleString('en-IN')}</span>
                                        {typeof product.discountPrice === 'number' && product.discountPrice > product.basePrice && (
                                            <span className="text-sm line-through text-gray-400">₹{product.discountPrice.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. Festive Collections Section */}
            {festiveProducts.length > 0 && (
                <section className="py-12 bg-[#FCFAF7] reveal-on-scroll">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8">
                            <div>
                                <span className="text-[#A67C3D] font-black tracking-[0.4em] text-[10px] mb-4 block uppercase whitespace-nowrap">Special Moments</span>
                                <h2 className="text-[46px] md:text-[70px] font-serif text-[#2D241E] tracking-tighter">Festive <span className="text-[#A67C3D]">Collections</span></h2>
                            </div>
                            <Link to="/products?featured=true" className="text-xs font-black uppercase tracking-widest text-[#A67C3D] hover:underline mb-4">View All</Link>
                        </div>
                        <div className="flex gap-10 overflow-x-auto pb-12 snap-x no-scrollbar">
                            {festiveProducts.map((product) => (
                                <Link to={`/product/${product.slug || product._id}`} key={product._id} className="w-[320px] shrink-0 snap-center group">
                                    <div className="relative aspect-[3/4.5] overflow-hidden rounded-[2.5rem] mb-6 shadow-lg group-hover:shadow-2xl transition-all duration-500 bg-white">
                                        <img src={product.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]" alt={product.name} />
                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[12px] font-black px-8 py-3 rounded-full uppercase tracking-widest shadow-xl whitespace-nowrap z-20">Festive</div>
                                    </div>
                                    <h3 className="font-serif text-xl text-[#2D241E] truncate mb-2">{product.name}</h3>
                                    <span className="text-2xl font-bold text-[#2D241E]">₹{product.basePrice.toLocaleString('en-IN')}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}




            {/* Craftsmanship Section (Animated Grid) */}
            <section className="py-16 bg-[#2D241E] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A67C3D]/10 rounded-full blur-[120px] -mr-[300px] -mt-[300px]" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="reveal-on-scroll">
                            <p className="text-[10px] font-black tracking-[0.35em] uppercase text-white/70 mb-3">
                                Welcome to
                            </p>
                            <h2 className="text-3xl md:text-5xl font-serif mb-8 text-[#DBB37C] leading-tight">
                                {atelier?.title?.includes('Welcome') ? (
                                    <span>Sri Vinayaka Collections</span>
                                ) : (
                                    atelier?.title || 'The 60-Day Sri Vinayaka Cycle'
                                )}
                            </h2>
                            <p className="text-white/60 text-base font-light mb-12 leading-relaxed">
                                {atelier?.description || 'True luxury cannot be rushed. From the selection of organic dyes in the foothills of the Himalayas to the final precision of the loom in Varanasi, every Sri Vinayaka Collections saree is a testament to the virtue of patience.'}
                            </p>

                            <div className="space-y-12">
                                {(atelier?.steps || [
                                    { num: '01', title: 'The Vision & Draft', description: 'Master weavers sketch patterns based on architectural fractals and floral geometry.' },
                                    { num: '02', title: 'The Silk Alchemy', description: 'Silk threads are treated with natural botanical extracts to achieve the perfect depth of hue.' },
                                    { num: '03', title: 'The Sacred Weave', description: 'Up to three artisans work simultaneously on a single loom for up to 12 hours a day.' }
                                ]).map((step, idx) => (
                                    <div key={idx} className="flex gap-8 group">
                                        <div className="text-3xl font-serif text-[#DBB37C] opacity-30 group-hover:opacity-100 transition">{step.num}</div>
                                        <div>
                                            <h4 className="text-xl font-bold mb-2 tracking-tight">{toTitleCase(step.title)}</h4>
                                            <p className="text-sm md:text-base text-white/60 leading-relaxed font-medium tracking-tight mt-1">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 reveal-on-scroll">
                            <div className="aspect-[2/3] rounded-3xl overflow-hidden mt-12 shadow-2xl bg-[#333]">
                                {!loading && atelier?.image1 && <img src={atelier.image1} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />}
                                {loading && <div className="w-full h-full animate-pulse bg-white/5"></div>}
                            </div>
                            <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl bg-[#333]">
                                {!loading && atelier?.image2 && <img src={atelier.image2} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />}
                                {loading && <div className="w-full h-full animate-pulse bg-white/5"></div>}
                            </div>
                        </div>
                    </div>
                </div>
            </section >

            {/* Social / Instagram Mockup */}
            <section className="py-6 bg-[#FCFAF7]">
                <div className="container mx-auto px-6 text-center">
                    <span className="text-[#A67C3D] font-black tracking-[0.4em] text-[10px] mb-4 block">{social?.badge || 'for updates'}</span>
                    <h2 className="text-3xl md:text-5xl font-serif text-[#2D241E] mb-4 italic">
                        {social?.title || 'Stop Scrolling. Start Following 👀'}
                    </h2>
                    {(() => {
                        const handle = 'srivinayakacollection01';
                        let handleHref = `https://instagram.com/${handle}`;
                        return (
                            <a href={handleHref} target="_blank" rel="noopener noreferrer" className="inline-block text-[#A67C3D] font-bold tracking-widest text-sm mb-8 hover:underline">
                                @{handle}
                            </a>
                        );
                    })()}

                    <div className={Array.isArray(social?.posts) && social.posts.length > 4 ? "overflow-hidden mb-8 py-4" : "mb-8 "}>
                        {(() => {
                            const defaultPosts = [
                                { image: 'https://backendapis.srivinayakacollections.com/uploads/chanderi.png', link: '#' },
                                { image: 'https://backendapis.srivinayakacollections.com/uploads/cotton_silk.png', link: '#' },
                                { image: 'https://backendapis.srivinayakacollections.com/uploads/organza.png', link: '#' },
                                { image: 'https://backendapis.srivinayakacollections.com/uploads/modern_banarasi.png', link: '#' }
                            ];
                            const rawPosts = Array.isArray(social?.posts) && social.posts.length > 0 ? social.posts : defaultPosts;
                            let posts = rawPosts.filter(p => p?.image);
                            const showMarquee = false; // Disabled marquee to keep it static
                            const list = posts;
                            const socialFallbackSrc = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="%23EADECB" width="400" height="400"/><text x="50%" y="50%" fill="%238c6246" font-family="sans-serif" font-size="14" text-anchor="middle" dy=".3em">Image</text></svg>');

                            const renderList = (
                                <div className={showMarquee ? "flex gap-2 w-max" : "grid grid-cols-2 lg:grid-cols-4 gap-4"}>
                                    {list.map((post, index) => {
                                        let link = post.link || "#";
                                        // Fix accidentally prepended hash or similar browser-added prefixes
                                        if (link.startsWith('#http')) link = link.substring(1);

                                        const isExternal = /^https?:\/\//i.test(link) || link.includes('instagram.com') || link.includes('facebook.com');

                                        // If it's a domain but missing protocol, add it
                                        if (!/^https?:\/\//i.test(link) && (link.includes('instagram.com') || link.includes('facebook.com'))) {
                                            link = `https://${link}`;
                                        }

                                        return (
                                            <a
                                                key={index}
                                                href={link}
                                                target={isExternal ? "_blank" : "_self"}
                                                rel={isExternal ? "noopener noreferrer" : ""}
                                                className={`aspect-[4/5] rounded-[2rem] md:rounded-[4rem] overflow-hidden relative group bg-white shadow-sm hover:shadow-2xl transition-all duration-700 ${showMarquee ? 'flex-shrink-0 w-[280px] md:w-[380px]' : ''}`}
                                            >
                                                <img
                                                    src={getImageDisplayUrl(post.image) || socialFallbackSrc}
                                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-[2s] ease-out"
                                                    alt={`Social Post ${index + 1}`}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = socialFallbackSrc; }}
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center text-white pointer-events-none">
                                                    <div className="transform scale-150 rotate-12 group-hover:scale-100 group-hover:rotate-0 transition-all duration-700">
                                                        <Instagram size={48} strokeWidth={1} />
                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            );
                            return renderList;
                        })()}
                    </div>
                </div>
            </section>            {/* Brand Values */}
            <section className="py-12 border-t border-[#EADECB] bg-white">
                <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-[#2D241E]">
                    {brandValues.length > 0 ? (
                        brandValues.map((v, i) => (
                            <div key={v._id} className="text-center group reveal-on-scroll" style={{ transitionDelay: `${i * 100}ms` }}>
                                <div className={`w-16 h-16 bg-[#FCFAF7] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#EADECB] transition-transform duration-500 ${i % 2 === 0 ? 'group-hover:rotate-12' : 'group-hover:-rotate-12'}`}>
                                    {valueIcons[v.icon] || <ShieldCheck className="text-[#A67C3D]" size={32} />}
                                </div>
                                <h4 className="font-serif text-lg text-[#2D241E] mb-2 font-black tracking-tighter italic">{toTitleCase(v.title)}</h4>
                                <p className="text-[10px] text-gray-500 font-bold tracking-widest leading-relaxed">{v.description}</p>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="text-center group reveal-on-scroll">
                                <div className="w-16 h-16 bg-[#FCFAF7] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#EADECB] group-hover:rotate-12 transition-transform duration-500">
                                    <ShieldCheck className="text-[#A67C3D]" size={32} />
                                </div>
                                <h4 className="font-serif text-lg text-[#2D241E] mb-2 font-black tracking-tighter italic">Purity Guaranteed</h4>
                                <p className="text-[10px] text-gray-500 font-bold tracking-widest leading-relaxed">Silk Mark Certified Authentic Weaver Collections</p>
                            </div>
                            <div className="text-center group reveal-on-scroll [transition-delay:100ms]">
                                <div className="w-16 h-16 bg-[#FCFAF7] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#EADECB] group-hover:-rotate-12 transition-transform duration-500">
                                    <Wind className="text-[#A67C3D]" size={32} />
                                </div>
                                <h4 className="font-serif text-lg text-[#2D241E] mb-2 font-black tracking-tighter italic">Ethereal Drapes</h4>
                                <p className="text-[10px] text-gray-500 font-bold tracking-widest leading-relaxed">Lightweight & Hand-curated for Modern Comfort</p>
                            </div>
                            <div className="text-center group reveal-on-scroll [transition-delay:200ms]">
                                <div className="w-16 h-16 bg-[#FCFAF7] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#EADECB] group-hover:rotate-12 transition-transform duration-500">
                                    <Truck className="text-[#A67C3D]" size={32} />
                                </div>
                                <h4 className="font-serif text-lg text-[#2D241E] mb-2 font-black tracking-tighter italic">Express Transit</h4>
                                <p className="text-[10px] text-gray-500 font-bold tracking-widest leading-relaxed">Secure Global Fulfillment to 180+ Destinations</p>
                            </div>
                            <div className="text-center group reveal-on-scroll [transition-delay:300ms]">
                                <div className="w-16 h-16 bg-[#FCFAF7] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#EADECB] group-hover:-rotate-12 transition-transform duration-500">
                                    <RefreshCcw className="text-[#A67C3D]" size={32} />
                                </div>
                                <h4 className="font-serif text-lg text-[#2D241E] mb-2 font-black tracking-tighter italic">Heritage Exchange</h4>
                                <p className="text-[10px] text-gray-500 font-bold tracking-widest leading-relaxed">Hassle-free 7 Day Seamless Returns Policy</p>
                            </div>
                        </>
                    )}
                </div>
            </section>


            <section className="py-8 bg-white reveal-on-scroll">
                <div className="container mx-auto px-6">
                    <div className="bg-[#1a1a1a] rounded-[4rem] flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] min-h-[500px]">
                        {!loading && (appPromo?.backgroundImage || appPromo?.mockupImage) && (
                            <div className="absolute inset-0 z-0">
                                <img src={appPromo.backgroundImage || appPromo.mockupImage} className="w-full h-full object-cover opacity-60" alt="Background" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] via-[#1a1a1a]/80 to-transparent" />
                            </div>
                        )}

                        <div className="lg:w-1/2 text-center lg:text-left relative z-10 p-10 md:p-12 lg:pl-20">
                            <span className="text-[#DBB37C] font-black tracking-[0.4em] text-[10px] mb-6 block">{appPromo?.badge || 'THE SRI VINAYAKA IN YOUR POCKET'}</span>
                            <h2 className="text-4xl md:text-6xl font-serif text-white mb-8 italic">{appPromo?.title || 'Experience Heritage, Refined for Mobile.'}</h2>
                            <p className="text-white/60 mb-10 text-lg font-light leading-relaxed">
                                {appPromo?.description || 'Our bespoke collections are now closer than ever. Enjoy seamless browsing, augmented reality trials, and early access to drops only on our official mobile flagship.'}
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                                <a href={appPromo?.appleStoreLink || "#"} className="bg-black text-white px-8 py-3.5 rounded-2xl flex items-center gap-4 border border-white/10 hover:border-[#DBB37C]/50 transition-all duration-300 group shadow-2xl min-w-[220px]">
                                    <Apple size={34} className="fill-white" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Download on the</span>
                                        <p className="text-xl font-bold leading-none tracking-tight">App Store</p>
                                    </div>
                                </a>
                                <a href={appPromo?.playStoreLink || "#"} className="bg-black text-white px-8 py-3.5 rounded-2xl flex items-center gap-4 border border-white/10 hover:border-[#DBB37C]/50 transition-all duration-300 group shadow-2xl min-w-[220px]">
                                    <Play size={30} className="fill-[#DBB37C] text-[#DBB37C]" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Get it on</span>
                                        <p className="text-xl font-bold leading-none tracking-tight">Google Play</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative w-full flex justify-center lg:justify-end mt-10 lg:mt-0 z-10 lg:pr-20 lg:py-12">
                            <div className="relative mx-auto lg:mx-0 w-[240px] h-[480px] sm:w-[260px] sm:h-[520px] lg:w-[280px] lg:h-[560px] bg-[#111] rounded-[2.5rem] sm:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
                                {appPromo?.mockupImages && appPromo.mockupImages.length > 0 ? (
                                    appPromo.mockupImages.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={getUploadUrl(img)}
                                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === currentAppImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                            alt={`App Screen ${idx + 1}`}
                                        />
                                    ))
                                ) : (
                                    !loading && appPromo?.mockupImage && <img src={appPromo.mockupImage} className="absolute inset-0 w-full h-full object-cover" alt="Mobile App Experience" />
                                )}
                                {loading && <div className="absolute inset-0 w-full h-full animate-pulse bg-white/5"></div>}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black/40 backdrop-blur-md rounded-b-xl z-20" />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/20 rounded-full z-20" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Newsletter section */}
            < section className="py-12" >
                <div className="container mx-auto px-6">
                    <div className="bg-[#2D241E] rounded-[4rem] p-12 md:p-24 text-center reveal-on-scroll relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] pointer-events-none" />
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-serif text-[#DBB37C] mb-6 whitespace-nowrap">Join Sri Vinayaka Collections</h2>
                            <p className="text-white/60 mb-12 text-lg font-medium tracking-tight [font-size:10px] tracking-[0.2em]">Acquire first privilege to new archive drops, artisan interviews, and early bridal slots.</p>

                            {isSubscribed ? (
                                <div className="bg-white/10 backdrop-blur-md border border-[#DBB37C]/30 p-8 rounded-full animate-fade-in flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-[#DBB37C] flex items-center justify-center text-[#2D241E] mb-2 shadow-lg animate-bounce">
                                        <Star size={24} fill="currentColor" />
                                    </div>
                                    <h3 className="text-white font-serif text-2xl italic tracking-wide">You've Entered the Circle.</h3>
                                    <p className="text-[#DBB37C] text-[10px] font-black tracking-[0.3em]">Welcome home to the Sri Vinayaka.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleNewsletterSubmit} className="flex flex-col md:flex-row gap-4">
                                    <input
                                        type="email"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                        className="flex-1 bg-white/5 border border-white/20 px-8 py-5 rounded-full text-white placeholder:text-white/30 focus:outline-none focus:border-[#DBB37C] backdrop-blur-md transition-all"
                                    />
                                    <button type="submit" className="bg-[#DBB37C] text-[#2D241E] px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all shadow-2xl">
                                        Subscribe Now
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section >

            {/* Styles for marquee & zoom */}
            < style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marquee2 {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(0%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .animate-marquee2 {
                    animation: marquee2 60s linear infinite;
                }
                @keyframes subtle-zoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                // .animate-subtle-zoom {
                //     animation: subtle-zoom 20s ease-in-out infinite alternate;
                // }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .reveal-on-scroll { opacity: 0; transform: translateY(30px); transition: all 0.8s ease-out; }
                .reveal-on-scroll.active { opacity: 1; transform: translateY(0); }
                .reveal-from-right { opacity: 0; transform: translateX(60px); transition: all 1.2s cubic-bezier(0.22, 1, 0.36, 1); }
                .reveal-from-right.active { opacity: 1; transform: translateX(0); }
            `}} />
        </div >
    );
};

export default Home;
