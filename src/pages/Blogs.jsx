import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, FileText } from 'lucide-react';
import API from '../api';
import { getImageDisplayUrl } from '../config/urls';

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data } = await API.get('/api/blogs');
                // Filter out drafts for the public website
                setBlogs(data.filter(b => !b.isDraft));
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#FCFAF7] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-[#EADECB] border-t-[#A67C3D] rounded-full animate-spin"></div>
                <p className="font-serif text-[#2D241E] animate-pulse">Gathering Stories...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-[#FCFAF7] min-h-screen pt-32 pb-20">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-20 relative">
                    <span className="text-[#A67C3D] font-black uppercase tracking-[0.4em] text-[10px] mb-4 block animate-fade-up">Chronicles of Heritage</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-[#2D241E] mb-6 animate-fade-up [animation-delay:200ms]">Blogs & News</h1>
                    <div className="w-24 h-1 bg-[#DBB37C] mx-auto rounded-full animate-fade-up [animation-delay:400ms]"></div>
                </div>

                {blogs.length === 0 ? (
                    <div className="text-center py-40 bg-white rounded-[3rem] shadow-sm border border-[#EADECB]/50">
                        <FileText className="mx-auto text-[#EADECB] mb-6" size={64} />
                        <h3 className="text-2xl font-serif text-[#2D241E]">The archives are currently quiet.</h3>
                        <p className="text-gray-400 mt-2">Check back soon for new stories from the loom.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {blogs.map((blog, idx) => (
                            <Link 
                                key={blog._id} 
                                to={`/blog/${blog.slug || blog._id}`}
                                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-[#EADECB]/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col h-full animate-fade-up"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    {blog.thumbnail ? (
                                        <img 
                                            src={getImageDisplayUrl(blog.thumbnail)} 
                                            alt={blog.title} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#FCFAF7] flex items-center justify-center text-[#EADECB]">
                                            <FileText size={48} strokeWidth={1} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-6 text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">
                                        <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#A67C3D]" /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        <span className="flex items-center gap-1.5"><User size={12} className="text-[#A67C3D]" /> {blog.author}</span>
                                    </div>
                                    
                                    <h3 className="text-2xl font-serif text-[#2D241E] mb-4 group-hover:text-[#A67C3D] transition-colors line-clamp-2 leading-tight">
                                        {blog.title}
                                    </h3>
                                    
                                    <p className="text-gray-500 text-sm font-light leading-relaxed line-clamp-3 mb-8">
                                        {blog.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blogs;
