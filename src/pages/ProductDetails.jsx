import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { Check, Truck, ShieldCheck, Heart, ChevronRight, X, ZoomIn } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { IMAGE_BASE_URL } from '../config/urls';

const getProductGalleryImages = (product) =>
    Array.isArray(product?.images) ? product.images.filter(Boolean) : [];

const normalizeVariantPrice = (variant, fallbackBasePrice = 0) => {
    if (!variant) return Number(fallbackBasePrice || 0);

    const explicitBasePrice = Number(variant.basePrice ?? 0);
    if (explicitBasePrice > 0) return explicitBasePrice;

    return Math.max(Number(fallbackBasePrice || 0) + Number(variant.additionalPrice || 0), 0);
};

const normalizeVariantMrp = (variant, fallbackMrp = 0, resolvedBasePrice = 0) => {
    if (!variant) return Math.max(Number(fallbackMrp || 0), Number(resolvedBasePrice || 0));

    const explicitMrpPrice = Number(variant.mrpPrice ?? 0);
    if (explicitMrpPrice > 0) return explicitMrpPrice;

    return Math.max(Number(fallbackMrp || 0), Number(resolvedBasePrice || 0));
};

const ProductDetails = () => {
    const { id } = useParams(); // can be ObjectId or slug
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const [added, setAdded] = useState(false);

    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    const [bestsellers, setBestsellers] = useState([]);
    const [trending, setTrending] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const prodRes = await API.get(`/api/products/${id}`);

                setProduct(prodRes.data);
                if (prodRes.data.images?.length > 0) {
                    setMainImage(prodRes.data.images[0]);
                }
                if (prodRes.data.variants?.length > 0) {
                    setSelectedColor(prodRes.data.variants[0].color);
                    setSelectedSize(prodRes.data.variants[0].size);
                }
            } catch (error) {
                console.error('Error fetching details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        const fetchExtras = async () => {
            try {
                const [bestRes, trendRes] = await Promise.all([
                    API.get('/api/products?bestSeller=true&limit=10'),
                    API.get('/api/products?newArrival=true&limit=10')
                ]);
                setBestsellers(bestRes.data.products || bestRes.data);
                setTrending(trendRes.data.products || trendRes.data);
            } catch (err) {
                console.error('Error fetching extras', err);
            }
        };
        fetchExtras();
    }, [id]);

    useEffect(() => {
        const selectedVariant = product?.variants?.find(v => v.color === selectedColor && v.size === selectedSize) || product?.variants?.[0];
        const galleryImages = getProductGalleryImages(product);
        setMainImage(selectedVariant?.imageUrl || galleryImages[0] || '');
    }, [selectedColor, selectedSize, product]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="w-16 h-16 border-4 border-amber-900 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-serif text-xl text-amber-900 animate-pulse">Unveiling the Masterpiece...</p>
        </div>
    );
    if (!product) return <div className="min-h-screen flex items-center justify-center">Saree details not found.</div>;

    const basePrice = product.basePrice || 0;

    // Variant Logic
    const colorOptions = product.variants ? Array.from(new Map(product.variants.map(v => [v.color, { color: v.color, colorHex: v.colorHex }])).values()) : [];
    const sizeOptions = product.variants && selectedColor ?
        [...new Set(product.variants.filter(v => v.color === selectedColor).map(v => v.size))] :
        (product.variants ? [...new Set(product.variants.map(v => v.size))] : []);

    const selectedVariant = product.variants?.find(v => v.color === selectedColor && v.size === selectedSize) || product.variants?.[0];
    const displayImages = getProductGalleryImages(product);

    const finalPrice = selectedVariant
        ? normalizeVariantPrice(selectedVariant, basePrice)
        : Number(basePrice);
    const variantMrp = selectedVariant
        ? normalizeVariantMrp(selectedVariant, product.discountPrice, finalPrice)
        : 0;
    const hasMrp = variantMrp > finalPrice || (typeof product.discountPrice === 'number' && product.discountPrice > finalPrice);
    const mrp = variantMrp > finalPrice ? variantMrp : (hasMrp ? product.discountPrice : finalPrice);
    const savingsPercent = hasMrp ? Math.round(((mrp - finalPrice) / mrp) * 100) : 0;
    const currentStock = selectedVariant ? selectedVariant.countInStock : product.countInStock;
    const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

    const handleAddToCart = () => {
        addToCart(product, 1, {
            finalPrice: finalPrice,
            originalMrp: mrp,
            variant: selectedVariant ? { ...selectedVariant, size: selectedSize, color: selectedColor, sku: currentSku } : null
        });
        setAdded(true);
    };

    return (
        <div className="bg-white pb-20">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <nav className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <ol className="flex items-center gap-2">
                        <li><Link to="/" className="hover:text-amber-900 transition">Atelier</Link></li>
                        <ChevronRight size={10} />
                        <li><Link to="/products" className="hover:text-amber-900 transition">Collections</Link></li>
                        {product.category && (
                            <>
                                <ChevronRight size={10} />
                                <li><Link to={`/products?category=${product.category._id}`} className="hover:text-amber-900 transition">{product.category.name}</Link></li>
                            </>
                        )}
                        {product.subCategory && (
                            <>
                                <ChevronRight size={10} />
                                <li><Link to={`/products?category=${product.category?._id}&subCategory=${product.subCategory._id}`} className="hover:text-amber-900 transition">{product.subCategory.name}</Link></li>
                            </>
                        )}
                        {product.childCategory && (
                            <>
                                <ChevronRight size={10} />
                                <li><Link to={`/products?category=${product.category?._id}&subCategory=${product.subCategory?._id}&childCategory=${product.childCategory._id}`} className="hover:text-amber-900 transition">{product.childCategory.name}</Link></li>
                            </>
                        )}
                        <ChevronRight size={10} />
                        <li className="text-amber-900 font-black truncate max-w-[150px] md:max-w-none">{product.name}</li>
                    </ol>
                </nav>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                    {/* Left Column: Image Only */}
                    <div className="w-full lg:w-[55%]">
                        <div className="flex flex-col md:flex-row-reverse gap-4">
                            <div 
                                onClick={() => setIsZoomOpen(true)}
                                className="flex-1 bg-gray-50 md:max-h-[75vh] min-h-[400px] aspect-[3/4] rounded-3xl overflow-hidden relative shadow-2xl shadow-amber-900/5 cursor-pointer"
                            >
                                <img
                                    src={mainImage || `${IMAGE_BASE_URL}/uploads/banarasi.png`}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                                {product.isBestSeller && (
                                    <div className="absolute top-6 left-6 bg-amber-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-tighter z-10 shadow-lg">Bestseller</div>
                                )}
                            </div>
                            {displayImages.length > 1 && (
                                <div className="grid grid-cols-5 gap-3 mt-4">
                                    {displayImages.slice(0, 5).map((img, idx) => (
                                        <button
                                            key={`${img}-${idx}`}
                                            type="button"
                                            onClick={() => setMainImage(img)}
                                            className={`aspect-[3/4] rounded-2xl overflow-hidden border-2 transition ${mainImage === img ? 'border-amber-600' : 'border-gray-100 hover:border-amber-300'}`}
                                        >
                                            <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Selection & Buying Interface (Right Column) */}
                    <div className="w-full lg:w-[45%] space-y-8 lg:sticky lg:top-32 h-fit">
                        <div>
                            <span className="text-amber-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-3 block">Individually Handcrafted</span>
                            <h1 className="text-3xl lg:text-4xl font-serif text-gray-900 mb-4 leading-[1.1]">{product.name}</h1>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b pb-2 border-gray-100">
                                <span>SKU: {currentSku}</span>
                                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                <span>{product.brand || 'Sri Vinayaka Collections'}</span>
                            </div>

                            <div className="flex flex-col gap-1 mb-4">
                                <div className="flex items-baseline gap-4">
                                    {hasMrp && (
                                        <span className="text-lg text-gray-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                                    )}
                                    <span className="text-4xl font-black text-gray-900">₹{finalPrice.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {hasMrp && savingsPercent > 0 && (
                                        <span className="text-[10px] text-green-700 font-black bg-green-50 px-2 py-1 rounded-full tracking-[0.16em] uppercase">
                                            You save {savingsPercent}%
                                        </span>
                                    )}
                                    <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                                        Luxury Packaging Included
                                    </span>
                                </div>
                            </div>
                        </div>




                        {/* Variant Selection UI */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-6 pt-2 pb-4">
                                {/* Color Selection */}
                                {colorOptions.length > 0 && colorOptions.some(c => c.color) && (
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color</span>
                                            <span className="text-xs font-bold text-amber-900">{selectedColor}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {colorOptions.map((opt, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setSelectedColor(opt.color);
                                                        const availableSizes = product.variants.filter(v => v.color === opt.color).map(v => v.size);
                                                        setSelectedSize(availableSizes[0] || '');
                                                    }}
                                                    className={`w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${selectedColor === opt.color ? 'border-amber-600 ring-4 ring-amber-100' : 'border-gray-200 hover:border-gray-400'}`}
                                                    style={{ backgroundColor: opt.colorHex || opt.color, backgroundImage: (opt.colorHex === '' || !opt.colorHex) ? 'linear-gradient(45deg, #ccc, #eee)' : '' }}
                                                    title={opt.color}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Size Selection */}
                                {sizeOptions.length > 0 && (sizeOptions.length > 1 || sizeOptions[0] !== 'Free Size') && (
                                    <div className="pt-2">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Size Selection</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {sizeOptions.map((size, idx) => {
                                                const variantExists = product.variants.find(v => v.color === selectedColor && v.size === size);
                                                const outOfStock = variantExists ? variantExists.countInStock <= 0 : true;

                                                return (
                                                    <button
                                                        key={idx}
                                                        disabled={outOfStock}
                                                        onClick={() => setSelectedSize(size)}
                                                        className={`px-6 py-3 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 
                                                            ${outOfStock ? 'opacity-40 cursor-not-allowed border-dashed border-gray-300 text-gray-400' :
                                                                selectedSize === size ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-gray-200 text-gray-500 hover:border-amber-300'}`}
                                                    >
                                                        {size} {outOfStock && <span className="text-[8px] block mt-1 text-red-500 font-bold uppercase">Sold Out</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                            {added ? (
                                <div className="flex-[3] flex gap-4">
                                    <Link
                                        to="/products"
                                        className="flex-1 font-black py-5 px-4 rounded-2xl border-2 border-amber-900 text-amber-900 transition-all duration-300 transform active:scale-95 uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center text-center leading-tight hover:bg-amber-50"
                                    >
                                        Continue Shopping
                                    </Link>
                                    <Link
                                        to="/cart"
                                        className="flex-1 font-black py-5 px-4 rounded-2xl bg-amber-900 text-white shadow-xl shadow-amber-900/20 hover:bg-black transition-all duration-300 transform active:scale-95 uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center text-center leading-tight whitespace-nowrap"
                                    >
                                        Go To Cart
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={handleAddToCart}
                                    disabled={currentStock === 0}
                                    className={`flex-[3] font-black py-5 px-10 rounded-2xl shadow-2xl transition-all duration-300 transform active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-3 ${currentStock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                                        'bg-amber-900 text-white hover:bg-black shadow-amber-900/20'
                                        }`}
                                >
                                    {currentStock === 0 ? 'Sold Out' : 'Add to Shopping Bag'}
                                </button>
                            )}
                            <button
                                onClick={() => toggleWishlist(product)}
                                className={`flex-1 p-5 border-2 rounded-2xl transition-all duration-300 flex items-center justify-center ${isInWishlist(product._id) ? 'border-red-100 bg-red-50 text-red-500' : 'border-gray-100 text-gray-400 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600'}`}
                            >
                                <Heart size={24} strokeWidth={1.5} fill={isInWishlist(product._id) ? "currentColor" : "none"} />
                            </button>
                        </div>


                    </div>
                </div>

                {/* Detailed Product Information: Split into Left and Right sections */}
                <div className="mt-20 pt-20 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
                    {/* Left side: Fabric Particulars */}
                    <div className="space-y-6">
                        <span className="text-amber-600 font-black uppercase tracking-[0.4em] text-[10px] block">Technical Details</span>
                        <h3 className="text-2xl lg:text-3xl font-serif text-gray-900">Catalogue Spec</h3>
                        <div className="bg-gray-50 rounded-3xl p-8 lg:p-10 border border-gray-100 shadow-sm mt-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 border-b border-gray-200 pb-4">Fabric Particulars</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12">
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Base Fabric</span>
                                    <span className="text-lg font-bold text-gray-900 border-l-2 border-amber-800 pl-4">{product.fabric || 'Pure Silk'}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Zari Technique</span>
                                    <span className="text-lg font-bold text-gray-900 border-l-2 border-amber-800 pl-4">{product.zariType || 'Not Specified'}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dimensions</span>
                                    <span className="text-lg font-bold text-gray-900 border-l-2 border-amber-800 pl-4">{product.sareeLength} + {product.blouseLength} (Blouse)</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Primary Hue</span>
                                    <span className="text-lg font-bold text-gray-900 border-l-2 border-amber-800 pl-4">{product.color || 'Artisan Dye'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges under particulars */}
                        <div className="grid grid-cols-3 gap-8 pt-12 border-t border-gray-100 text-[9px] font-black uppercase tracking-widest text-gray-400">
                            <div className="flex flex-col items-center text-center gap-3 group">
                                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-900 group-hover:bg-amber-900 group-hover:text-white transition-all duration-500">
                                    <Truck size={20} />
                                </div>
                                Secure Transit
                            </div>
                            <div className="flex flex-col items-center text-center gap-3 group">
                                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-900 group-hover:bg-amber-900 group-hover:text-white transition-all duration-500">
                                    <ShieldCheck size={20} />
                                </div>
                                Authenticity
                            </div>
                            <div className="flex flex-col items-center text-center gap-3 group">
                                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-900 group-hover:bg-amber-900 group-hover:text-white transition-all duration-500">
                                    <Check size={20} />
                                </div>
                                Returnable
                            </div>
                        </div>
                    </div>

                    {/* Right side: Description & Craftsmanship Note */}
                    <div className="space-y-8">
                        <span className="text-amber-600 font-black uppercase tracking-[0.4em] text-[10px] block">The Story</span>
                        <h3 className="text-2xl lg:text-3xl font-serif text-gray-900 italic">Curated Description</h3>
                        <div className="prose prose-amber prose-lg max-w-none text-gray-600 leading-relaxed font-light first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-amber-900 mt-8">
                            {product.description}
                        </div>
                        <div className="p-8 bg-amber-50/50 rounded-3xl border border-amber-100 mt-12">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-amber-900 mb-2">Artisan Note</h5>
                            <p className="text-xs text-amber-800/70 italic leading-relaxed">
                                Each piece is strictly quality controlled. Slight variations in the weave or color are the hallmark of handcrafted products and add to their unique charm.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Discover More Sections (Bestsellers & Trending) */}
                <div className="mt-12 border-t border-gray-100 pt-8 pb-12">
                    {/* BEST SELLERS */}
                    <div className="mb-10">
                        <div className="mb-8">
                            <span className="text-amber-600 font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">Curated For You</span>
                            <h2 className="text-3xl lg:text-4xl font-serif text-gray-900">Bestsellers</h2>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                            {bestsellers.map((prod) => (
                                <Link key={prod._id} to={`/product/${prod._id}`} className="w-[240px] md:w-[280px] flex-shrink-0 snap-center group">
                                    <div className="aspect-[3/4] h-[320px] md:h-[380px] bg-gray-50 rounded-2xl overflow-hidden mb-4 relative shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                                        <img src={prod.images?.[0] || `${IMAGE_BASE_URL}/uploads/banarasi.png`} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={prod.name} />
                                        {prod.isBestSeller && (
                                            <div className="absolute top-4 left-4 bg-amber-600 text-white text-[8px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow">Bestseller</div>
                                        )}
                                    </div>
                                    <h3 className="font-serif text-lg text-gray-900 truncate group-hover:text-amber-700 transition-colors">{prod.name}</h3>
                                    <p className="font-bold text-gray-900 mt-1">₹{prod.basePrice?.toLocaleString('en-IN')}</p>
                                </Link>
                            ))}
                            <Link to="/products?bestSeller=true" className="min-w-[200px] md:min-w-[240px] flex-shrink-0 snap-center flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl group border-2 border-dashed border-gray-200 hover:border-amber-600 hover:bg-amber-50 transition aspect-[3/4]">
                                <span className="text-amber-900 font-bold uppercase tracking-widest text-xs group-hover:-translate-y-2 transition duration-300">View All</span>
                                <div className="mt-4 w-12 h-12 rounded-full border border-amber-900/30 flex items-center justify-center group-hover:bg-amber-900 group-hover:text-white transition duration-300 group-hover:border-transparent"><ChevronRight size={24} /></div>
                            </Link>
                        </div>
                    </div>

                    {/* TRENDING NOW */}
                    {Array.isArray(trending) && trending.length > 0 && (
                        <div className="mb-8">
                            <div className="mb-8">
                                <span className="text-amber-600 font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">Discover More</span>
                                <h2 className="text-3xl lg:text-4xl font-serif text-gray-900">Trending Now</h2>
                            </div>
                            <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                                {trending.map((prod) => (
                                    <Link key={prod._id} to={`/product/${prod._id}`} className="w-[240px] md:w-[280px] flex-shrink-0 snap-center group">
                                        <div className="aspect-[3/4] h-[320px] md:h-[380px] bg-gray-50 rounded-2xl overflow-hidden mb-4 relative shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                                            <img src={prod.images?.[0] || `${IMAGE_BASE_URL}/uploads/banarasi.png`} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={prod.name} />
                                        </div>
                                        <h3 className="font-serif text-lg text-gray-900 truncate group-hover:text-amber-700 transition-colors">{prod.name}</h3>
                                        <p className="font-bold text-gray-900 mt-1">₹{prod.basePrice?.toLocaleString('en-IN')}</p>
                                    </Link>
                                ))}
                                <Link to="/products?newArrival=true" className="min-w-[200px] md:min-w-[240px] flex-shrink-0 snap-center flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl group border-2 border-dashed border-gray-200 hover:border-amber-600 hover:bg-amber-50 transition aspect-[3/4]">
                                    <span className="text-amber-900 font-bold uppercase tracking-widest text-xs group-hover:-translate-y-2 transition duration-300">View All</span>
                                    <div className="mt-4 w-12 h-12 rounded-full border border-amber-900/30 flex items-center justify-center group-hover:bg-amber-900 group-hover:text-white transition duration-300 group-hover:border-transparent"><ChevronRight size={24} /></div>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* STICKY BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 py-3 px-4 z-40 md:hidden flex justify-between items-center shadow-2xl">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sri Vinayaka Luxury</span>
                    <span className="text-lg font-black text-amber-900">₹{finalPrice.toLocaleString('en-IN')}</span>
                </div>
                {added ? (
                    <div className="flex gap-2">
                        <Link to="/products" className="font-black py-3 px-4 rounded-xl text-[9px] uppercase tracking-widest transition-all border-2 border-amber-900 text-amber-900 whitespace-nowrap">Shop More</Link>
                        <Link to="/cart" className="font-black py-3 px-4 rounded-xl text-[9px] uppercase tracking-widest transition-all bg-amber-900 text-white whitespace-nowrap">Checkout</Link>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        disabled={currentStock === 0}
                        className={`font-black py-3 px-8 rounded-xl text-xs uppercase tracking-widest transition-all ${currentStock === 0 ? 'bg-gray-300 text-gray-500' : 'bg-amber-900 text-white'}`}
                    >
                        {currentStock === 0 ? 'Sold Out' : 'Add to Bag'}
                    </button>
                )}
            </div>

            {/* FULLSCREEN IMAGE ZOOM POPUP */}
            {isZoomOpen && (
                <div 
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-3xl p-4 md:p-10 animate-in fade-in duration-500"
                    onClick={() => setIsZoomOpen(false)}
                >
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsZoomOpen(false); }}
                        className="absolute top-6 right-6 bg-amber-900 text-white p-3 rounded-full shadow-2xl hover:bg-black transition-all duration-300 z-[10000] active:scale-90"
                        title="Close Preview"
                    >
                        <X size={28} strokeWidth={2.5} />
                    </button>
                    <div 
                        className="relative max-w-5xl w-full h-full flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={mainImage || `${IMAGE_BASE_URL}/uploads/banarasi.png`}
                            alt={product.name}
                            className="max-w-full max-h-full object-contain shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-2xl animate-in zoom-in-95 duration-500"
                        />
                    </div>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-amber-900/40 text-[10px] font-black uppercase tracking-[0.4em] pointer-events-none">
                        Refined Details • {product.name}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
