'use client'

import React, { useState, useEffect } from 'react'
import CMSLink from '../components/CMSLink'

const Navbar = ({ logo, navItems, cta }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get the base URL from env
    const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || '';
    const logoUrl = logo?.url ? (logo.url.startsWith('http') ? logo.url : `${baseUrl}${logo.url}`) : null;

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
                isScrolled 
                ? 'py-4 bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)]' 
                : 'py-8 bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
                {/* Logo */}
                <CMSLink url="/" className="relative z-[110] flex items-center">
                    {logoUrl ? (
                        <img 
                            src={logoUrl} 
                            alt="Logo" 
                            className="h-8 md:h-10 w-auto transition-all duration-300 hover:scale-105 active:scale-95" 
                        />
                    ) : (
                        <span className="text-2xl font-black tracking-tighter text-gray-900">
                             ANTI<span className="text-gray-400">GRAVITY</span>
                        </span>
                    )}
                </CMSLink>

                {/* Desktop Nav Items */}
                <div className="hidden md:flex items-center space-x-10">
                    {navItems?.map((item, index) => (
                        <CMSLink 
                            key={index}
                            {...item}
                            className="text-sm font-semibold text-gray-600 hover:text-black transition-all duration-300 relative group"
                        >
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full" />
                        </CMSLink>
                    ))}
                </div>

                {/* CTA Group */}
                <div className="flex items-center space-x-6">
                    {cta?.label && (
                        <CMSLink 
                            url={cta.url}
                            className="hidden md:inline-flex px-8 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-black/20"
                        >
                            {cta.label}
                        </CMSLink>
                    )}

                    {/* Hamburger Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="relative z-[110] md:hidden w-10 h-10 flex items-center justify-center text-gray-900 bg-gray-50 rounded-full focus:outline-none transition-colors border border-gray-100"
                        aria-label="Toggle menu"
                    >
                        <div className="w-5 h-4 flex flex-col justify-between">
                            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 transform origin-left ${mobileMenuOpen ? 'rotate-45 translate-x-1' : ''}`} />
                            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'}`} />
                            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 transform origin-left ${mobileMenuOpen ? '-rotate-45 translate-x-1' : ''}`} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div 
                className={`fixed inset-0 bg-white/95 backdrop-blur-2xl z-[105] transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] md:hidden ${
                    mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
                }`}
            >
                <div className="flex flex-col items-start justify-center h-full px-12 space-y-8">
                    {navItems?.map((item, index) => (
                        <CMSLink 
                            key={index}
                            {...item}
                            className={`text-4xl font-black text-gray-900 hover:text-gray-500 transition-all duration-500 transform ${
                                mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            }`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.label}
                        </CMSLink>
                    ))}
                    
                    {cta?.label && (
                        <div className={`w-full pt-8 transform transition-all duration-700 delay-300 ${
                            mobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                        }`}>
                            <CMSLink 
                                url={cta.url}
                                className="inline-flex px-12 py-5 bg-black text-white text-xl font-bold rounded-full text-center"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {cta.label}
                            </CMSLink>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar