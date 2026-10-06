import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flower2, Quote } from 'lucide-react';
import API from '../api';
import { IMAGE_BASE_URL, getImageDisplayUrl } from '../config/urls';

const About = () => {
    const [page, setPage] = useState(null);
    const [atelier, setAtelier] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pageRes, atelierRes] = await Promise.all([
                    API.get('/api/pages/about-us'),
                    API.get('/api/cms/atelier')
                ]);
                setPage(pageRes.data);
                setAtelier(atelierRes.data);
            } catch (error) {
                console.error('Error fetching About data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Intersection Observer for scroll animations
    useEffect(() => {
        if (loading) return;
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

    if (loading) return (
        <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-[#EADECB] border-t-[#DBB37C] rounded-full animate-spin"></div>
                <p className="font-serif text-xl text-[#2D241E] animate-pulse">Unfolding Our Story...</p>
            </div>
        </div>
    );

    const metadata = page?.metadata || {};
    const hero = metadata.hero || { subtitle: 'The Eternal Legacy', title: 'Our Philosophy' };
    const heritage = metadata.heritage || {
        subtitle: 'The Loom of Legend',
        title: 'Where Every Thread Whispers a Story.',
        description: "At Sri Vinayaka Collections, we don't just sell sarees; we preserve a 5,000-year-old dialogue between nature and the loom.",
        stat1Value: '2,000+', stat1Label: 'Active Looms',
        stat2Value: '15+', stat2Label: 'States Represented',
        image: ''
    };
    const artisan = metadata.artisan || {
        subtitle: 'Artisan Spotlight',
        title: 'Meet Murugan, the 4th Gen Weaver.',
        description: '"The loom is my prayer. Each sari takes my life’s breath for 30 days. When you wear a Sri Vinayaka Collections Kanjivaram, you are not just wearing silk, you are wearing my family\'s heritage."',
        stat1Value: '42 Years', stat1Label: 'At the Loom',
        stat2Value: 'Kanchipuram', stat2Label: 'Master Studio',
        image: ''
    };
    const footer = metadata.footer || {
        subtitle: 'Continual Discovery',
        title: 'Be part of our unending story.',
        description: 'We invite you to the sanctuary. Experience the weights, the drapes, and the whispers of the loom in person or through our digital archives.'
    };

    return (
        <div className="bg-[#FCFAF7] min-h-screen overflow-x-hidden">
            {/* Hero Header */}
            <div className="bg-[#2D241E] py-40 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#DBB37C]/10 rounded-full blur-[120px] -mr-[300px] -mt-[300px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#A67C3D]/5 rounded-full blur-[100px] -ml-[200px] -mb-[200px]" />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <span className="text-[#DBB37C] font-black tracking-[0.5em] text-[10px] mb-8 block animate-fade-up">{hero.subtitle}</span>
                    <h1 className="text-6xl md:text-8xl font-serif text-white mb-8 animate-fade-up [animation-delay:200ms]">{hero.title}</h1>
                    <div className="flex items-center justify-center gap-4 animate-fade-up [animation-delay:400ms]">
                        <div className="w-16 h-px bg-[#DBB37C]/30"></div>
                        <Flower2 className="text-[#DBB37C]/50" size={24} />
                        <div className="w-16 h-px bg-[#DBB37C]/30"></div>
                    </div>
                </div>
            </div>

            {/* Heritage Section */}
            <section className="py-32 bg-white relative">
                <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-24">
                    <div className="lg:w-1/2 relative reveal-on-scroll">
                        <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] group aspect-[3/4]">
                            <img
                                src={getImageDisplayUrl(heritage.image) || `${IMAGE_BASE_URL}/uploads/cotton_silk.png`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]"
                                alt="Master Artisan at the Loom"
                                onError={(e) => { e.target.src = `${IMAGE_BASE_URL}/uploads/organza.png`; }}
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[4rem]" />
                        </div>
                        {/* Decorative Backdrops */}
                        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-[#FCFAF7] rounded-[4rem] -z-0 border border-[#EADECB]" />
                        <div className="absolute -top-12 -left-12 text-[#DBB37C]/10 animate-spin-slow">
                            <Flower2 size={240} strokeWidth={0.5} />
                        </div>
                    </div>

                    <div className="lg:w-1/2 reveal-on-scroll [transition-delay:300ms]">
                        <div className="inline-flex items-center gap-3 text-[#A67C3D] font-black uppercase tracking-[0.4em] text-[10px] mb-8">
                            <span className="w-8 h-px bg-[#A67C3D]"></span>
                            {heritage.subtitle}
                        </div>
                        <h2 className="text-5xl md:text-7xl font-serif text-[#2D241E] mb-10 leading-[1.1]">{heritage.title}</h2>
                        <p className="text-gray-500 mb-12 text-xl leading-relaxed font-light">
                            {heritage.description}
                        </p>
                        <div className="grid grid-cols-2 gap-12 mb-16">
                            <div className="group">
                                <h5 className="text-4xl font-serif text-[#2D241E] mb-2 group-hover:text-[#A67C3D] transition-colors">{heritage.stat1Value}</h5>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{heritage.stat1Label}</p>
                            </div>
                            <div className="group">
                                <h5 className="text-4xl font-serif text-[#2D241E] mb-2 group-hover:text-[#A67C3D] transition-colors">{heritage.stat2Value}</h5>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{heritage.stat2Label}</p>
                            </div>
                        </div>
                        <Link to="/products" className="inline-flex items-center gap-6 bg-[#2D241E] text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-[#A67C3D] transition-all duration-500 shadow-xl group">
                            Explore Archive <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Artisan Spotlight */}
            <section className="py-32 bg-white reveal-on-scroll">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="lg:w-1/2 order-2 lg:order-1">
                            <span className="text-[#A67C3D] font-black tracking-[0.4em] text-[10px] mb-6 block">{artisan.subtitle}</span>
                            <h2 className="text-5xl md:text-7xl font-serif text-[#201A16] mb-8">{artisan.title}</h2>
                            <p className="text-gray-600 text-lg mb-12 font-light leading-relaxed whitespace-pre-line">
                                {artisan.description}
                            </p>
                            <div className="flex items-center gap-12">
                                <div>
                                    <p className="text-3xl font-serif text-[#201A16] mb-1">{artisan.stat1Value}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{artisan.stat1Label}</p>
                                </div>
                                <div className="h-12 w-px bg-[#EADECB]" />
                                <div>
                                    <p className="text-3xl font-serif text-[#201A16] mb-1">{artisan.stat2Value}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{artisan.stat2Label}</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 order-1 lg:order-2 relative">
                            <div className="aspect-square relative z-10 overflow-hidden rounded-[4rem] shadow-2xl">
                                <img src={getImageDisplayUrl(artisan.image) || `${IMAGE_BASE_URL}/uploads/organza.png`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2s]" alt="Master Artisan" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-[#EADECB] rounded-full -z-0 opacity-40 animate-pulse" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Craftsmanship Section (Atelier Cycle) */}
            {atelier && (
                <section className="py-32 bg-[#2D241E] text-white relative overflow-hidden">
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
                                        atelier?.title || 'The 60-Day Atelier Cycle'
                                    )}
                                </h2>
                                <p className="text-white/60 text-base font-light mb-12 leading-relaxed">
                                    {atelier.description}
                                </p>

                                <div className="space-y-12">
                                    {atelier.steps?.map((step, idx) => (
                                        <div key={idx} className="flex gap-8 group">
                                            <div className="text-3xl font-serif text-[#DBB37C] opacity-30 group-hover:opacity-100 transition">{step.num}</div>
                                            <div>
                                                <h4 className="text-xl font-bold mb-2 tracking-tight">{step.title}</h4>
                                                <p className="text-sm text-white/40 leading-relaxed font-medium tracking-tight">{step.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 reveal-on-scroll">
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden mt-12 shadow-2xl">
                                    <img src={getImageDisplayUrl(atelier.image1)} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                                </div>
                                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                                    <img src={getImageDisplayUrl(atelier.image2)} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Sacred Text Section */}
            {page && (
                <section className="py-32 relative bg-[#FCFAF7]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/fabric-of-squares.png')] opacity-5 pointer-events-none" />

                    <div className="container mx-auto px-6 max-w-5xl reveal-on-scroll">
                        <div className="relative">
                            <div className="bg-white p-12 md:p-24 rounded-[5rem] shadow-[0_40px_100px_-30px_rgba(45,36,30,0.1)] border border-[#EADECB]/50 relative z-10 overflow-hidden">
                                <div className="flex justify-center mb-16 relative">
                                    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#EADECB] to-transparent"></div>
                                    <div className="relative bg-white px-8">
                                        <Quote size={48} className="text-[#DBB37C] opacity-20" />
                                    </div>
                                </div>

                                <div className="text-center mb-16">
                                    <h3 className="text-4xl md:text-5xl font-serif text-[#2D241E] leading-tight flex flex-col items-center gap-4">
                                        <span className="text-[#A67C3D] font-black uppercase tracking-[0.4em] text-[10px]">The Sacred Text</span>
                                        {page.title}
                                        <div className="w-12 h-1 bg-[#DBB37C] rounded-full mt-4"></div>
                                    </h3>
                                </div>

                                <div
                                    className="prose prose-2xl prose-amber text-gray-600 leading-[1.8] max-w-none text-center font-light"
                                    dangerouslySetInnerHTML={{
                                        __html: page.content.replace(/<p>/g, '<p class="mb-8 last:mb-0">')
                                    }}
                                />

                                <div className="mt-20 flex justify-center opacity-10">
                                    <Flower2 size={60} strokeWidth={0.5} />
                                </div>
                            </div>
                            <div className="absolute -top-16 -left-16 w-64 h-64 bg-[#DBB37C]/5 rounded-full blur-[80px] -z-0" />
                            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#A67C3D]/5 rounded-full blur-[100px] -z-0" />
                        </div>
                    </div>
                </section>
            )}

            {/* Footer Journey Section */}
            <section className="py-40 bg-[#2D241E] text-white relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-px bg-gradient-to-r from-transparent via-[#DBB37C]/20 to-transparent" />
                <div className="container mx-auto px-6 text-center relative z-10 reveal-on-scroll">
                    <span className="text-[#DBB37C] font-black tracking-[0.5em] text-[10px] mb-8 block">{footer.subtitle}</span>
                    <h2 className="text-5xl md:text-7xl font-serif mb-12 leading-tight">{footer.title}</h2>
                    <p className="text-white/50 max-w-2xl mx-auto mb-16 text-xl font-light leading-relaxed">
                        {footer.description}
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <Link to="/products" className="bg-[#DBB37C] text-[#2D241E] px-14 py-6 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white transition-all shadow-2xl active:scale-95">
                            Acquire First Piece
                        </Link>
                        <Link to="/contact" className="text-white/70 hover:text-white font-black uppercase tracking-[0.3em] text-[11px] transition-colors border-b border-white/10 hover:border-white pb-1">
                            Request Concierge
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
