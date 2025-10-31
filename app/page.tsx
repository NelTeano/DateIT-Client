'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Smooth scroll for anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.slice(1);
        const element = document.getElementById(id || '');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                DateIt
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-pink-600 transition">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-pink-600 transition">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-pink-600 transition">Stories</a>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/auth" className="text-gray-700 hover:text-pink-600 transition font-medium">
                Login
              </Link>
              <Link href="/auth" className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition transform hover:scale-105">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 pt-24 pb-20 overflow-hidden">
        {/* Animated Blobs */}
        <div className="absolute w-[300px] h-[300px] bg-gradient-to-br from-pink-400 to-purple-500 rounded-full top-10 left-10 blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-purple-400 to-pink-500 rounded-full bottom-10 right-10 blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center min-h-[600px]">
            <div className="animate-fade-in-left">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Find Your
                <span className="block bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Perfect Match
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with people who share your interests, values, and dreams. Your love story starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth" className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl transition transform hover:scale-105 text-center">
                  Get Started Free
                </Link>
                <a href="#how-it-works" className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg hover:shadow-lg transition border-2 border-gray-200 text-center">
                  Learn More
                </a>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">10K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">5K+</div>
                  <div className="text-sm text-gray-600">Matches Made</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">500+</div>
                  <div className="text-sm text-gray-600">Success Stories</div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-fade-in-right">
              <div className="relative z-10 animate-float">
                {/* Phone Mockup */}
                <div className="w-[300px] mx-auto bg-white rounded-[3rem] shadow-2xl p-4 border-8 border-gray-900">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-[2rem] overflow-hidden">
                    {/* Status Bar */}
                    <div className="bg-white px-6 py-2 flex items-center justify-between">
                      <span className="text-xs font-semibold">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-4 space-y-4">
                      {/* Profile Card */}
                      <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                          S
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-800">Sarah, 25</h3>
                        <p className="text-sm text-center text-gray-600 mt-2">Coffee lover ☕ | Adventure seeker 🌍</p>
                        
                        <div className="flex gap-2 mt-4">
                          <button className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold">
                            Like
                          </button>
                          <button className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold">
                            Pass
                          </button>
                        </div>
                      </div>
                      
                      {/* Match Notification */}
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-pink-200 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">It&apos;s a Match! 💖</p>
                            <p className="text-xs text-gray-600">You and Sarah liked each other</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Hearts */}
              <div className="absolute top-10 right-10 w-12 h-12 text-pink-400 animate-float" style={{ animationDelay: '0.5s' }}>
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="absolute bottom-20 left-10 w-8 h-8 text-purple-400 animate-float" style={{ animationDelay: '1s' }}>
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">DateIt?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience dating reimagined with features designed to help you find genuine connections.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl border-2 border-pink-100 hover:transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Smart Matching</h3>
              <p className="text-gray-600">Our algorithm finds profiles that match your preferences and interests for meaningful connections.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-100 hover:transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Real-Time Chat</h3>
              <p className="text-gray-600">Connect instantly with your matches through our seamless, real-time messaging system.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl border-2 border-pink-100 hover:transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Safe & Secure</h3>
              <p className="text-gray-600">Your privacy matters. We use advanced security to keep your data safe and protected.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get started in three simple steps and begin your journey to finding love.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Profile</h3>
              <p className="text-gray-600">Sign up and build your profile with photos and details about yourself.</p>
            </div>
            
            {/* Step 2 */}
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Swiping</h3>
              <p className="text-gray-600">Browse profiles and swipe right on people you&apos;re interested in.</p>
            </div>
            
            {/* Step 3 */}
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Make Connections</h3>
              <p className="text-gray-600">When you both like each other, it&apos;s a match! Start chatting instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Success <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Stories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real people, real love stories. See how DateIt helped them find their perfect match.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl border-2 border-pink-100 hover:transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  J
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Jessica & Mark</h4>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">&quot;We matched on DateIt 6 months ago, and now we&apos;re planning our wedding! This app truly changed our lives. ❤️&quot;</p>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-100 hover:transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Alex & Sam</h4>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">&quot;Best dating app I&apos;ve ever used! The matching algorithm is spot on. Found my soulmate here! 💕&quot;</p>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl border-2 border-pink-100 hover:transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  E
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Emma & David</h4>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">&quot;Safe, fun, and easy to use. Met my boyfriend here and couldn&apos;t be happier! Highly recommend! 🎉&quot;</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 text-white animate-float">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="absolute bottom-10 right-20 w-24 h-24 text-white animate-float" style={{ animationDelay: '1s' }}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
            </svg>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Find Your Match?</h2>
          <p className="text-xl text-pink-100 mb-8">Join thousands of people who found love on DateIt. Your perfect match is waiting!</p>
          <Link href="/auth" className="inline-block px-8 py-4 bg-white text-pink-600 rounded-full font-bold text-lg hover:shadow-2xl transition transform hover:scale-105">
            Get Started Now - It&apos;s Free!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-2xl font-bold">DateIt</span>
              </div>
              <p className="text-gray-400">Find your perfect match and start your love story today.</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-pink-400 transition">About Us</Link></li>
                <li><Link href="#" className="hover:text-pink-400 transition">Careers</Link></li>
                <li><Link href="#" className="hover:text-pink-400 transition">Press</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-pink-400 transition">Help Center</Link></li>
                <li><Link href="#" className="hover:text-pink-400 transition">Safety Tips</Link></li>
                <li><Link href="#" className="hover:text-pink-400 transition">Contact Us</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-pink-400 transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-pink-400 transition">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-pink-400 transition">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DateIt. All rights reserved. Made with ❤️</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out;
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}