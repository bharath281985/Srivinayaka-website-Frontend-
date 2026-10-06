import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api';
import { ChevronDown, Filter, ChevronRight, Check, Grid, List, Sparkles, Palette } from 'lucide-react';
import { IMAGE_BASE_URL } from '../config/urls';

const ProductListing = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
    const [activeSubCategory, setActiveSubCategory] = useState(searchParams.get('subCategory') || 'all');
    const [activeChildCategory, setActiveChildCategory] = useState(searchParams.get('childCategory') || 'all');
    const [priceRange, setPriceRange] = useState(searchParams.get('priceRange') || 'all');
    const [expandedCategory, setExpandedCategory] = useState(searchParams.get('category') || null);
    const [expandedSubCategory, setExpandedSubCategory] = useState(searchParams.get('subCategory') || null);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const dropdownRef = useRef(null);

    const sortOptions = [
        { value: 'newest', label: 'Most Revered (Newest)' },
        { value: 'price_asc', label: 'Price: Low to High' },
        { value: 'price_desc', label: 'Price: High to Low' },
        { value: 'rating', label: 'Top Rated' }
    ];

    const currentSort = searchParams.get('sort') || 'newest';
    const currentLabel = sortOptions.find(opt => opt.value === currentSort)?.label || sortOptions[0].label;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Build query params for API
                const params = new URLSearchParams();
                const categoryId = searchParams.get('category');
                const subCategoryId = searchParams.get('subCategory');
                const childCategoryId = searchParams.get('childCategory');
                const isBestSeller = searchParams.get('bestSeller');
                const isNewArrival = searchParams.get('newArrival');
                const isFestive = searchParams.get('featured');
                const isWeekendSale = searchParams.get('weekendSale');
                const isRegular = searchParams.get('regular');
                const searchTerm = searchParams.get('q');
                const sortOrder = searchParams.get('sort') || 'newest';
                const priceParam = searchParams.get('priceRange');

                if (categoryId && categoryId !== 'all') params.append('category', categoryId);
                if (subCategoryId && subCategoryId !== 'all') params.append('subCategory', subCategoryId);
                if (childCategoryId && childCategoryId !== 'all') params.append('childCategory', childCategoryId);
                if (isBestSeller) params.append('bestSeller', 'true');
                if (isNewArrival) params.append('newArrival', 'true');
                if (isFestive) params.append('isFeatured', 'true');
                if (isWeekendSale) params.append('isWeekendSale', 'true');
                if (isRegular) params.append('isRegularCollection', 'true');
                if (searchTerm) params.append('q', searchTerm);
                if (sortOrder) params.append('sort', sortOrder);
                if (priceParam && priceParam !== 'all') {
                    const [min, max] = priceParam.split('-');
                    if (min) params.append('minPrice', min);
                    if (max) params.append('maxPrice', max);
                }

                const [prodRes, catRes] = await Promise.all([
                    API.get(`/api/products?${params.toString()}`),
                    API.get('/api/categories')
                ]);

                setProducts(prodRes.data.products || prodRes.data);
                setCategories(catRes.data);
            } catch (error) {
                console.error('Error fetching products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [searchParams]);

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

    const handleCategoryToggle = (id) => {
        if (id === 'all') {
            searchParams.delete('category');
            searchParams.delete('subCategory');
            searchParams.delete('childCategory');
            setActiveCategory('all');
            setActiveSubCategory('all');
            setActiveChildCategory('all');
            setExpandedCategory(null);
            setExpandedSubCategory(null);
        } else {
            searchParams.set('category', id);
            searchParams.delete('subCategory');
            searchParams.delete('childCategory');
            setActiveCategory(id);
            setActiveSubCategory('all');
            setActiveChildCategory('all');
            setExpandedCategory(expandedCategory === id ? null : id);
            setExpandedSubCategory(null);
        }
        setSearchParams(searchParams);
    };

    const handleSubCategoryToggle = (subId, parentId) => {
        if (subId === 'all') {
            searchParams.delete('subCategory');
            searchParams.delete('childCategory');
            searchParams.set('category', parentId);
            setActiveSubCategory('all');
            setActiveChildCategory('all');
            setExpandedSubCategory(null);
        } else {
            searchParams.set('subCategory', subId);
            searchParams.delete('childCategory');
            searchParams.set('category', parentId);
            setActiveSubCategory(subId);
            setActiveChildCategory('all');
            setExpandedSubCategory(expandedSubCategory === subId ? null : subId);
        }
        setSearchParams(searchParams);
        setActiveCategory(parentId);
    };

    const handleChildCategoryToggle = (childId, subId, parentId) => {
        if (childId === 'all') {
            searchParams.delete('childCategory');
            searchParams.set('subCategory', subId);
            searchParams.set('category', parentId);
            setActiveChildCategory('all');
        } else {
            searchParams.set('childCategory', childId);
            searchParams.set('subCategory', subId);
            searchParams.set('category', parentId);
            setActiveChildCategory(childId);
        }
        setSearchParams(searchParams);
        setActiveSubCategory(subId);
        setActiveCategory(parentId);
    };

    const handlePriceToggle = (range) => {
        if (range === 'all') {
            searchParams.delete('priceRange');
            setPriceRange('all');
        } else {
            searchParams.set('priceRange', range);
            setPriceRange(range);
        }
        setSearchParams(searchParams);
    };

    return (
        <div className="bg-[#FCFAF7] min-h-screen">
            <div className="container mx-auto px-6 pt-4 pb-12">
                {/* Header / Breadcrumbs */}
                <div className="mb-8 reveal-on-scroll relative z-[100]">
                    <nav className="text-[10px] border-b border-[#EADECB] pb-3 mb-6 uppercase tracking-[0.3em] text-gray-400 font-bold">
                        <ol className="list-reset flex items-center gap-3">
                            <li><Link to="/" className="hover:text-[#A67C3D] transition">The Atelier</Link></li>
                            <ChevronRight size={10} strokeWidth={3} />
                            <li><span className="text-[#A67C3D]">Curated Collections</span></li>
                        </ol>
                    </nav>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div>
                            <span className="text-[#A67C3D] font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">Archive Search</span>
                            <h1 className="text-[34px] md:text-[46px] font-serif text-[#2D241E] leading-tight">Sri Vinayaka <br /><span className="italic">Collections</span></h1>
                        </div>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className="flex items-center gap-4 bg-white/90 backdrop-blur-md border border-[#EADECB] px-8 py-3.5 rounded-full shadow-sm hover:shadow-md hover:border-[#DBB37C] transition-all duration-500 min-w-[280px] justify-between group active:scale-95"
                            >
                                <div className="flex items-center gap-3">
                                    <Sparkles size={14} className={`text-[#DBB37C] transition-transform duration-700 ${isSortOpen ? 'rotate-180 scale-110' : ''}`} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#2D241E]">
                                        {currentLabel}
                                    </span>
                                </div>
                                <ChevronDown size={14} className={`text-[#DBB37C]/60 transition-transform duration-500 ${isSortOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSortOpen && (
                                <div className="absolute top-full mt-3 right-0 w-[280px] bg-white border border-[#EADECB] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[100] overflow-hidden">
                                    <div className="py-2 bg-[#FCFAF7]">
                                        <div className="px-8 py-2 border-b border-[#EADECB]/30 mb-1">
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Sort Collection</span>
                                        </div>
                                        {sortOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    searchParams.set('sort', option.value);
                                                    setSearchParams(searchParams);
                                                    setIsSortOpen(false);
                                                }}
                                                className={`w-full text-left px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-between group/item ${currentSort === option.value
                                                    ? 'bg-white text-[#A67C3D]'
                                                    : 'text-[#2D241E] hover:bg-white/80 hover:text-[#A67C3D]'
                                                    }`}
                                            >
                                                <span className="relative">
                                                    {option.label}
                                                    <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-[#A67C3D] transition-all duration-500 ${currentSort === option.value ? 'w-full' : 'w-0 group-hover/item:w-full'}`} />
                                                </span>
                                                {currentSort === option.value ? (
                                                    <Check size={12} className="text-[#A67C3D]" />
                                                ) : (
                                                    <ChevronRight size={10} className="text-[#A67C3D]/30 opacity-0 group-hover/item:opacity-100 transition-all duration-300 -translate-x-1 group-hover/item:translate-x-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-80 flex-shrink-0 reveal-on-scroll">
                        <div className="sticky top-10">
                            <div className="flex justify-between items-center border-b border-[#EADECB] pb-6 mb-10">
                                <div className="flex items-center text-[10px] font-black text-[#2D241E] uppercase tracking-[0.4em]">
                                    <Filter size={18} className="mr-4 text-[#A67C3D]" /> Curate View
                                </div>
                                <button
                                    onClick={() => setSearchParams({})}
                                    className="text-[10px] font-black text-[#A67C3D] uppercase tracking-widest hover:underline"
                                >
                                    Reset
                                </button>
                            </div>

                            {/* Fabric Selection */}
                            <div className="mb-12">
                                <h3 className="font-black text-[#2D241E] mb-8 text-[11px] tracking-[0.3em] uppercase border-l-4 border-[#DBB37C] pl-4">Fabric Lineage</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                checked={activeCategory === 'all'}
                                                onChange={() => handleCategoryToggle('all')}
                                                className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer"
                                            />
                                            <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="ml-4 group-hover:translate-x-1 transition-transform">All Collections</span>
                                    </label>

                                    {(() => {
                                        const mainCategories = categories.filter(c => !c.parent || c.level === 1);
                                        const visibleCategories = showAllCategories ? mainCategories : mainCategories.slice(0, 6);

                                        return (
                                            <>
                                                {visibleCategories.map(cat => {
                                                    const subCats = categories.filter(c => (c.parent === cat._id || (c.parent?._id === cat._id)) && c.level === 2);
                                                    const isExpanded = expandedCategory === cat._id || activeCategory === cat._id;

                                                    return (
                                                        <div key={cat._id} className="flex flex-col">
                                                            <div className="flex items-center justify-between group">
                                                                <label className="flex items-center flex-1 text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition">
                                                                    <div className="relative flex items-center justify-center">
                                                                        <input
                                                                            type="radio"
                                                                            name="category"
                                                                            checked={activeCategory === cat._id && activeSubCategory === 'all'}
                                                                            onChange={() => handleCategoryToggle(cat._id)}
                                                                            className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer"
                                                                        />
                                                                        <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                                    </div>
                                                                    <span className="ml-4 group-hover:translate-x-1 transition-transform">{cat.name}</span>
                                                                </label>
                                                                {subCats.length > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.preventDefault(); setExpandedCategory(expandedCategory === cat._id ? null : cat._id); }}
                                                                        className="p-1 hover:bg-[#EADECB]/30 rounded transition"
                                                                    >
                                                                        <ChevronDown size={14} className={`text-[#A67C3D] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Subcategories Dropdown */}
                                                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && subCats.length > 0 ? 'max-h-[1000px] opacity-100 mt-2 mb-2' : 'max-h-0 opacity-0'}`}>
                                                                <div className="ml-6 space-y-3 pl-3 border-l-2 border-[#EADECB]">
                                                                    <label className="flex items-center text-gray-500 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group sub-cat">
                                                                        <div className="relative flex items-center justify-center">
                                                                            <input
                                                                                type="radio"
                                                                                name={`subcategory-${cat._id}`}
                                                                                checked={activeCategory === cat._id && activeSubCategory === 'all'}
                                                                                onChange={() => handleSubCategoryToggle('all', cat._id)}
                                                                                className="peer appearance-none h-4 w-4 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer"
                                                                            />
                                                                            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                                        </div>
                                                                        <span className="ml-3 group-hover:translate-x-1 transition-transform">All {cat.name}</span>
                                                                    </label>

                                                                    {subCats.map(sub => {
                                                                        const childCats = categories.filter(c => (c.parent === sub._id || (c.parent?._id === sub._id)) && c.level === 3);
                                                                        const isSubExpanded = expandedSubCategory === sub._id || activeSubCategory === sub._id;

                                                                        return (
                                                                            <div key={sub._id} className="flex flex-col">
                                                                                <div className="flex items-center justify-between group">
                                                                                    <label className="flex items-center flex-1 text-gray-500 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition">
                                                                                        <div className="relative flex items-center justify-center">
                                                                                            <input
                                                                                                type="radio"
                                                                                                name={`subcategory-${cat._id}`}
                                                                                                checked={activeSubCategory === sub._id && activeChildCategory === 'all'}
                                                                                                onChange={() => handleSubCategoryToggle(sub._id, cat._id)}
                                                                                                className="peer appearance-none h-4 w-4 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer"
                                                                                            />
                                                                                            <div className="absolute w-1.5 h-1.5 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                                                        </div>
                                                                                        <span className="ml-3 group-hover:translate-x-1 transition-transform">{sub.name}</span>
                                                                                    </label>
                                                                                    {childCats.length > 0 && (
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={(e) => { e.preventDefault(); setExpandedSubCategory(expandedSubCategory === sub._id ? null : sub._id); }}
                                                                                            className="p-1 hover:bg-[#EADECB]/30 rounded transition"
                                                                                        >
                                                                                            <ChevronDown size={12} className={`text-[#A67C3D] transition-transform ${isSubExpanded ? 'rotate-180' : ''}`} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>

                                                                                {/* Child Categories Dropdown */}
                                                                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSubExpanded && childCats.length > 0 ? 'max-h-[500px] opacity-100 mt-2 mb-2' : 'max-h-0 opacity-0'}`}>
                                                                                    <div className="ml-4 space-y-2 pl-3 border-l border-[#EADECB]">
                                                                                        <label className="flex items-center text-gray-400 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group child-cat">
                                                                                            <div className="relative flex items-center justify-center">
                                                                                                <input
                                                                                                    type="radio"
                                                                                                    name={`childcategory-${sub._id}`}
                                                                                                    checked={activeSubCategory === sub._id && activeChildCategory === 'all'}
                                                                                                    onChange={() => handleChildCategoryToggle('all', sub._id, cat._id)}
                                                                                                    className="peer appearance-none h-3 w-3 border border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer"
                                                                                                />
                                                                                                <div className="absolute w-1 h-1 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                                                            </div>
                                                                                            <span className="ml-2 group-hover:translate-x-1 transition-transform">All {sub.name}</span>
                                                                                        </label>
                                                                                        {childCats.map(child => (
                                                                                            <label key={child._id} className="flex items-center text-gray-400 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group child-cat">
                                                                                                <div className="relative flex items-center justify-center">
                                                                                                    <input
                                                                                                        type="radio"
                                                                                                        name={`childcategory-${sub._id}`}
                                                                                                        checked={activeChildCategory === child._id}
                                                                                                        onChange={() => handleChildCategoryToggle(child._id, sub._id, cat._id)}
                                                                                                        className="peer appearance-none h-3 w-3 border border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer"
                                                                                                    />
                                                                                                    <div className="absolute w-1 h-1 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                                                                </div>
                                                                                                <span className="ml-2 group-hover:translate-x-1 transition-transform">{child.name}</span>
                                                                                            </label>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {mainCategories.length > 6 && (
                                                    <button
                                                        onClick={() => setShowAllCategories(!showAllCategories)}
                                                        className="text-[#A67C3D] text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-1 hover:underline"
                                                    >
                                                        {showAllCategories ? 'Show Less' : 'View More'} <ChevronDown size={12} className={`transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
                                                    </button>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Price Filter */}
                            <div className="mb-12 border-t border-[#EADECB] pt-10">
                                <h3 className="font-black text-[#2D241E] mb-8 text-[11px] tracking-[0.3em] uppercase border-l-4 border-[#DBB37C] pl-4">Price Range</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" checked={priceRange === 'all'} onChange={() => handlePriceToggle('all')} className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer" />
                                            <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="ml-4 group-hover:translate-x-1 transition-transform">All Prices</span>
                                    </label>
                                    <label className="flex items-center text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" checked={priceRange === '-199'} onChange={() => handlePriceToggle('-199')} className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer" />
                                            <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="ml-4 group-hover:translate-x-1 transition-transform">Under ₹199</span>
                                    </label>
                                    <label className="flex items-center text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" checked={priceRange === '-499'} onChange={() => handlePriceToggle('-499')} className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer" />
                                            <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="ml-4 group-hover:translate-x-1 transition-transform">Under ₹499</span>
                                    </label>
                                    <label className="flex items-center text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" checked={priceRange === '-699'} onChange={() => handlePriceToggle('-699')} className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer" />
                                            <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="ml-4 group-hover:translate-x-1 transition-transform">Under ₹699</span>
                                    </label>
                                    <label className="flex items-center text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" checked={priceRange === '-999'} onChange={() => handlePriceToggle('-999')} className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer" />
                                            <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="ml-4 group-hover:translate-x-1 transition-transform">Under ₹999</span>
                                    </label>
                                    <label className="flex items-center text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" checked={priceRange === '-1999'} onChange={() => handlePriceToggle('-1999')} className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer" />
                                            <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="ml-4 group-hover:translate-x-1 transition-transform">Under ₹1999</span>
                                    </label>
                                    <label className="flex items-center text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" checked={priceRange === '-2999'} onChange={() => handlePriceToggle('-2999')} className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer" />
                                            <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="ml-4 group-hover:translate-x-1 transition-transform">Under ₹2999</span>
                                    </label>
                                    <label className="flex items-center text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" checked={priceRange === '-4999'} onChange={() => handlePriceToggle('-4999')} className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer" />
                                            <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="ml-4 group-hover:translate-x-1 transition-transform">Under ₹4999</span>
                                    </label>
                                    <label className="flex items-center text-[#2D241E] text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-[#A67C3D] transition group">
                                        <div className="relative flex items-center justify-center">
                                            <input type="radio" checked={priceRange === '-9999'} onChange={() => handlePriceToggle('-9999')} className="peer appearance-none h-5 w-5 border-2 border-[#EADECB] rounded-full checked:border-[#A67C3D] transition-all cursor-pointer" />
                                            <div className="absolute w-2 h-2 rounded-full bg-[#A67C3D] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="ml-4 group-hover:translate-x-1 transition-transform">Under ₹9999</span>
                                    </label>
                                </div>
                            </div>


                            {/* Marketing Toggles */}
                            <div className="mb-12 border-t border-[#EADECB] pt-10">
                                <h3 className="font-black text-[#2D241E] mb-8 text-[11px] tracking-[0.3em] uppercase border-l-4 border-[#DBB37C] pl-4">Curations</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={searchParams.has('bestSeller')}
                                            onChange={(e) => {
                                                if (e.target.checked) searchParams.set('bestSeller', 'true');
                                                else searchParams.delete('bestSeller');
                                                setSearchParams(searchParams);
                                            }}
                                            className="w-10 h-5 bg-[#EADECB] rounded-full appearance-none relative cursor-pointer checked:bg-[#A67C3D] transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 peer checked:before:translate-x-5 before:transition-transform"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#2D241E] transition">Bestsellers</span>
                                    </label>
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={searchParams.has('newArrival')}
                                            onChange={(e) => {
                                                if (e.target.checked) searchParams.set('newArrival', 'true');
                                                else searchParams.delete('newArrival');
                                                setSearchParams(searchParams);
                                            }}
                                            className="w-10 h-5 bg-[#EADECB] rounded-full appearance-none relative cursor-pointer checked:bg-[#A67C3D] transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 peer checked:before:translate-x-5 before:transition-transform"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#2D241E] transition">New Arrivals</span>
                                    </label>
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={searchParams.has('featured')}
                                            onChange={(e) => {
                                                if (e.target.checked) searchParams.set('featured', 'true');
                                                else searchParams.delete('featured');
                                                setSearchParams(searchParams);
                                            }}
                                            className="w-10 h-5 bg-[#EADECB] rounded-full appearance-none relative cursor-pointer checked:bg-[#A67C3D] transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 peer checked:before:translate-x-5 before:transition-transform"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#2D241E] transition">Festive Collections</span>
                                    </label>
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={searchParams.has('weekendSale')}
                                            onChange={(e) => {
                                                if (e.target.checked) searchParams.set('weekendSale', 'true');
                                                else searchParams.delete('weekendSale');
                                                setSearchParams(searchParams);
                                            }}
                                            className="w-10 h-5 bg-[#EADECB] rounded-full appearance-none relative cursor-pointer checked:bg-[#A67C3D] transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 peer checked:before:translate-x-5 before:transition-transform"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#2D241E] transition">Weekend Sale</span>
                                    </label>
                                    <label className="flex items-center gap-4 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={searchParams.has('regular')}
                                            onChange={(e) => {
                                                if (e.target.checked) searchParams.set('regular', 'true');
                                                else searchParams.delete('regular');
                                                setSearchParams(searchParams);
                                            }}
                                            className="w-10 h-5 bg-[#EADECB] rounded-full appearance-none relative cursor-pointer checked:bg-[#A67C3D] transition-colors before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 peer checked:before:translate-x-5 before:transition-transform"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#2D241E] transition">Regular Collections</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                {[1, 2, 3, 6].map(i => (
                                    <div key={i} className="aspect-[3/4] bg-white rounded-[2rem] animate-pulse shadow-sm" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                {products.length === 0 ? (
                                    <div className="col-span-full py-40 text-center reveal-on-scroll">
                                        <div className="mb-6 opacity-20"><Palette size={80} className="mx-auto" /></div>
                                        <h3 className="text-3xl font-serif text-[#2D241E]/40 italic">This archive is currently empty.</h3>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-4">Try altering your curation filters</p>
                                    </div>
                                ) : (
                                    products.map((product, idx) => (
                                        <div key={product._id} className={`reveal-on-scroll group [transition-delay:${(idx % 6) * 100}ms]`}>
                                            <div className="relative aspect-[3/4] mb-8 rounded-[2.5rem] overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 bg-white">
                                                <Link to={`/product/${product.slug || product._id}`}>
                                                    <img
                                                        src={product.images && product.images.length > 0 ? product.images[0] : `${IMAGE_BASE_URL}/uploads/banarasi.png`}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-in-out"
                                                    />
                                                </Link>

                                                {/* Marketing Badges */}
                                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                                    {product.isBestSeller && (
                                                        <span className="bg-[#2D241E] text-white text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">Revered</span>
                                                    )}
                                                    {product.isNewArrival && (
                                                        <span className="bg-[#A67C3D] text-white text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">New Reveal</span>
                                                    )}
                                                    {product.isFeatured && (
                                                        <span className="bg-amber-600 text-white text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">Festive</span>
                                                    )}
                                                    {product.isWeekendSale && (
                                                        <span className="bg-red-600 text-white text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">Weekend Sale</span>
                                                    )}
                                                    {product.isRegularCollection && (
                                                        <span className="bg-gray-600 text-white text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">Regular</span>
                                                    )}
                                                </div>

                                                {/* Quick View Overlay */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
                                                    <Link
                                                        to={`/product/${product.slug || product._id}`}
                                                        className="bg-white text-[#2D241E] font-black uppercase tracking-widest text-[10px] px-10 py-4 rounded-full shadow-2xl transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500 hover:bg-[#DBB37C]"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>

                                            <div className="px-6 text-center">
                                                <p className="text-[#A67C3D] font-black text-[9px] uppercase tracking-[0.3em] mb-3">{product.fabric || 'Pure Heritage'}</p>
                                                <h3 className="font-serif text-2xl text-[#2D241E] mb-2 group-hover:text-[#A67C3D] transition-colors truncate">
                                                    <Link to={`/product/${product.slug || product._id}`}>
                                                        {product.name}
                                                    </Link>
                                                </h3>
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="flex items-center justify-center gap-4 flex-wrap">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-[10px] font-bold text-[#A67C3D] uppercase tracking-widest">Sale</span>
                                                            <span className="text-2xl font-bold text-[#2D241E]">
                                                                ₹{product.basePrice.toLocaleString('en-IN')}
                                                            </span>
                                                        </div>
                                                        {typeof product.discountPrice === 'number' && product.discountPrice > product.basePrice && (
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-baseline gap-1 text-gray-400">
                                                                    <span className="text-[9px] font-semibold uppercase">MRP</span>
                                                                    <span className="text-sm line-through opacity-60">
                                                                        ₹{product.discountPrice.toLocaleString('en-IN')}
                                                                    </span>
                                                                </div>
                                                                <span className="inline-flex items-center text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-tighter">
                                                                    Save {Math.round(((product.discountPrice - product.basePrice) / product.discountPrice) * 100)}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductListing;
