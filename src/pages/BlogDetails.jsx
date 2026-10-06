import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Tag, Quote, Flower2 } from 'lucide-react';
import API from '../api';
import { getImageDisplayUrl } from '../config/urls';

const BlogDetails = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [relatedBlogs, setRelatedBlogs] = useState([]);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const { data } = await API.get(`/api/blogs/${id}`);
                setBlog(data);
                
                // Fetch related blogs (latest 3)
                const { data: allBlogs } = await API.get('/api/blogs');
                setRelatedBlogs(allBlogs.filter(b => b._id !== data._id && !b.isDraft).slice(0, 3));
            } catch (error) {
                console.error('Error fetching blog details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#EADECB] border-t-[#A67C3D] rounded-full animate-spin"></div>
        </div>
    );

    if (!blog) return (
        <div className="min-h-screen bg-[#FCFAF7] pt-40 px-6 text-center">
            <h2 className="text-3xl font-serif text-[#2D241E] mb-6">Story not found</h2>
            <Link to="/blogs" className="inline-flex items-center gap-2 text-[#A67C3D] font-bold uppercase tracking-widest text-xs">
                <ArrowLeft size={16} /> Back to Archives
            </Link>
        </div>
    );

    return (
        <div className="bg-[#FCFAF7] min-h-screen pb-20">
            {/* Hero Header */}
            <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden pt-20">
                {blog.thumbnail ? (
                    <img 
                        src={getImageDisplayUrl(blog.thumbnail)} 
                        alt={blog.title} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-[#201A16]"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#201A16] via-[#201A16]/40 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-20">
                    <div className="container mx-auto">
                        <Link to="/blogs" className="inline-flex items-center gap-2 text-[#DBB37C] font-black uppercase tracking-[0.3em] text-[10px] mb-8 hover:gap-4 transition-all">
                            <ArrowLeft size={14} /> Back to Library
                        </Link>
                        <h1 className="text-4xl md:text-7xl font-serif text-white max-w-4xl leading-[1.1] mb-8 animate-fade-up">
                            {blog.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-8 text-[11px] text-white/70 font-black uppercase tracking-[0.2em] animate-fade-up [animation-delay:200ms]">
                            <span className="flex items-center gap-2"><Calendar size={14} className="text-[#DBB37C]" /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span className="flex items-center gap-2"><User size={14} className="text-[#DBB37C]" /> Written by {blog.author}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-6 -mt-10 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Main Content */}
                    <article className="lg:w-2/3 bg-white rounded-[3rem] p-8 md:p-20 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.05)] border border-[#EADECB]/30">
                        <div className="relative mb-16">
                            <Quote size={48} className="text-[#DBB37C] opacity-20 absolute -top-10 -left-6" />
                            <div className="relative z-10">
                                <p className="text-xl md:text-2xl font-serif text-[#2D241E] leading-relaxed italic opacity-80">
                                    Insights and narratives from the heart of the Sri Vinayaka collections atelier.
                                </p>
                            </div>
                        </div>

                        <div 
                            className="prose prose-xl prose-stone max-w-none text-gray-600 leading-relaxed font-light prose-headings:font-serif prose-headings:text-[#2D241E] prose-p:mb-8 blog-content"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />

                        <div className="mt-20 pt-10 border-t border-[#EADECB]/50 flex justify-between items-center overflow-x-auto gap-4">
                            <div className="flex gap-2">
                                {blog.tags && blog.tags.map((tag, idx) => (
                                    <span key={idx} className="bg-[#FCFAF7] text-[#A67C3D] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#EADECB]/50 flex items-center gap-1.5">
                                        <Tag size={10} /> {tag}
                                    </span>
                                ))}
                            </div>
                            <button className="flex items-center gap-2 text-[#2D241E] font-black uppercase tracking-widest text-[10px] hover:text-[#A67C3D] transition-colors whitespace-nowrap">
                                <Share2 size={16} /> Share Story
                            </button>
                        </div>
                    </article>

                    {/* Sidebar */}
                    <aside className="lg:w-1/3 space-y-12">
                        {/* Related Stories */}
                        <div className="bg-[#2D241E] rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Flower2 size={120} strokeWidth={0.5} />
                            </div>
                            <h3 className="text-2xl font-serif mb-8 text-[#DBB37C] relative z-10">Other Revelations</h3>
                            <div className="space-y-10 relative z-10">
                                {relatedBlogs.map((rBlog) => (
                                    <Link key={rBlog._id} to={`/blog/${rBlog.slug || rBlog._id}`} className="group block">
                                        <span className="text-[10px] text-[#DBB37C]/60 font-black uppercase tracking-widest mb-2 block group-hover:text-[#DBB37C] transition-colors">
                                            {new Date(rBlog.publishedAt || rBlog.createdAt).toLocaleDateString()}
                                        </span>
                                        <h4 className="text-lg font-serif group-hover:text-[#DBB37C] transition-colors leading-tight">
                                            {rBlog.title}
                                        </h4>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Newsletter Mini */}
                        <div className="bg-[#A67C3D] rounded-[2.5rem] p-10 text-white text-center">
                            <h3 className="text-2xl font-serif mb-4">Enter the Circle</h3>
                            <p className="text-sm text-white/80 font-light mb-8">Receive our monthly journal of artisan stories and new arrivals.</p>
                            <div className="space-y-4">
                                <input type="email" placeholder="Your email address" className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:bg-white/20 transition-all placeholder:text-white/40" />
                                <button className="w-full bg-white text-[#A67C3D] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl transition-all active:scale-95">
                                    Subscribe Now
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            
            {/* Design Element */}
            <div className="container mx-auto px-6 mt-20 text-center opacity-10">
                <Flower2 size={60} strokeWidth={0.5} className="mx-auto" />
            </div>
        </div>
    );
};

export default BlogDetails;
