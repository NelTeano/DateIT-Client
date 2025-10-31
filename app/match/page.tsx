'use client'
import React from 'react';
import { Heart, User, MessageCircle, Settings } from 'lucide-react';
import TinderCards from "../components/tinder-cards/tinder-cards";
import Header from '../components/header/header';
import MobileNav from '../components/mobile-nav/mobile-nav';

export default function MatchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col">

      <Header />
      {/* Main Content - Full Height Cards */}
      <main className="flex-1 overflow-hidden">
        <TinderCards />
      </main>
      {/* Bottom Navigation (Mobile) */}
      <MobileNav />

      {/* Decorative Elements */}
      <div className="fixed top-20 left-10 w-20 h-20 bg-pink-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="fixed bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
    </div>
  );
}