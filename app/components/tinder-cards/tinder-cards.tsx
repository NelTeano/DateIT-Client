'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Heart, X, MapPin, Briefcase, Info, Calendar, Loader2 } from 'lucide-react';

interface Card {
  _id: string;
  name: string;
  age: number;
  photoUrl: string;
  bio: string;
  gender: string;
}

type DragEventType = React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>;

export default function TinderCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'love' | 'nope' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [matchNotification, setMatchNotification] = useState<string | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const API_URL = `${process.env.NEXT_PUBLIC_PROD_API_URL}/api`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  // Fetch suggestions on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchSuggestions();
  }, [token]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/suggestions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCards(data.suggestions || []);
      } else {
        console.error('Failed to fetch suggestions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ likedUserId: userId })
      });

      const data = await response.json();

      if (data.isMatch) {
        // Show match notification
        setMatchNotification(cards[0]?.name || 'Someone');
        setTimeout(() => setMatchNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  const handlePass = async (userId: string) => {
    try {
      await fetch(`${API_URL}/auth/pass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ passedUserId: userId })
      });
    } catch (error) {
      console.error('Error passing user:', error);
    }
  };

  const handleDragStart = (e: DragEventType) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
  };

  const handleDragMove = (e: DragEventType | MouseEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    setDragOffset({ x: deltaX, y: deltaY });

    if (deltaX > 20) setStatus('love');
    else if (deltaX < -20) setStatus('nope');
    else setStatus(null);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 80;
    if (Math.abs(dragOffset.x) > threshold) {
      removeCard(dragOffset.x > 0);
    } else {
      setDragOffset({ x: 0, y: 0 });
      setStatus(null);
    }
  };

  const removeCard = async (isLove: boolean) => {
    if (cards.length === 0) return;

    const currentCard = cards[0];

    // Call API
    if (isLove) {
      await handleLike(currentCard._id);
    } else {
      await handlePass(currentCard._id);
    }

    // Remove card from UI
    setCards((prev) => prev.slice(1));
    setDragOffset({ x: 0, y: 0 });
    setStatus(null);
  };

  const handleButtonClick = (isLove: boolean) => {
    if (cards.length === 0) return;
    removeCard(isLove);
  };

  useEffect(() => {
    const handleMouseUp = () => handleDragEnd();
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, dragOffset]);

  const getCardStyle = (index: number): React.CSSProperties => {
    if (index === 0 && isDragging) {
      const rotate = dragOffset.x * 0.03 * (dragOffset.y / 80);
      return {
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotate}deg)`,
        transition: 'none',
        cursor: 'grabbing',
      };
    }

    const scale = Math.max(0.9, 1 - index * 0.05);
    const translateY = -10 * index;
    const opacity = Math.max(0.5, 1 - index * 0.15);

    return {
      transform: `scale(${scale}) translateY(${translateY}px)`,
      opacity,
      zIndex: cards.length - index,
    };
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
          <p className="text-gray-600 font-medium">Finding matches for you...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Please Login</h3>
          <p className="text-gray-600">You need to be logged in to see matches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-col relative">
      {/* Match Notification */}
      {matchNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl animate-in zoom-in">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-white" fill="white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">It's a Match!</h2>
            <p className="text-gray-600 text-lg mb-6">
              You and <span className="font-semibold text-pink-600">{matchNotification}</span> liked each other
            </p>
            <button
              onClick={() => {
                setMatchNotification(null);
                window.location.href = '/matches';
              }}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
            >
              Send a Message
            </button>
          </div>
        </div>
      )}

      {/* Status indicators */}
      <div className="absolute top-1/2 -mt-24 w-full text-center pointer-events-none z-20">
        <div className="flex justify-center">
          <X
            className={`absolute -left-32 w-32 h-32 text-red-500 transition-all duration-200 ${
              status === 'nope' ? 'opacity-100 scale-100 rotate-12' : 'opacity-0 scale-50'
            }`}
            strokeWidth={4}
          />
          <Heart
            className={`absolute -right-32 w-32 h-32 text-pink-500 transition-all duration-200 ${
              status === 'love' ? 'opacity-100 scale-100 -rotate-12' : 'opacity-0 scale-50'
            }`}
            strokeWidth={4}
            fill="currentColor"
          />
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-grow flex justify-center items-center z-10 px-4 py-4">
        <div className="relative w-full max-w-sm h-[600px] md:h-[650px]">
          {cards.map((card, index) => (
            <div
              key={card._id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}              
              className="absolute inset-0 bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ease-in-out"
              style={getCardStyle(index)}
              onMouseDown={index === 0 ? handleDragStart : undefined}
              onTouchStart={index === 0 ? handleDragStart : undefined}
              onTouchMove={index === 0 ? handleDragMove : undefined}
              onTouchEnd={index === 0 ? handleDragEnd : undefined}
            >
              {/* Card Image */}
              <div className="relative h-3/4">
                <img
                  src={card.photoUrl || `https://ui-avatars.com/api/?name=${card.name}&size=600&background=random`}
                  alt={card.name}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  draggable={false}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                
                {/* Card Info on Image */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-3xl font-bold mb-3 pointer-events-none drop-shadow-lg">
                    {card.name}, {card.age}
                  </h2>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm pointer-events-none drop-shadow">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="capitalize">{card.gender}</span>
                    </div>
                  </div>
                </div>

                {/* Info Button */}
                <button className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition border border-white/30">
                  <Info className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Card Bio */}
              <div className="h-1/4 p-6 flex items-center bg-gradient-to-b from-gray-50 to-white">
                <p className="text-gray-700 text-base pointer-events-none leading-relaxed line-clamp-3">
                  {card.bio || 'No bio available'}
                </p>
              </div>
            </div>
          ))}

          {cards.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-3xl shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-white" fill="white" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-2">No more profiles</p>
              <p className="text-gray-500 text-center px-8 mb-6">Check back later for new matches!</p>
              <button
                onClick={fetchSuggestions}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-shrink-0 h-24 flex justify-center items-center gap-6 pb-6">
        <button
          onClick={() => handleButtonClick(false)}
          className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 focus:outline-none border-2 border-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={cards.length === 0}
        >
          <X className="w-9 h-9 text-red-500" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => handleButtonClick(true)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={cards.length === 0}
        >
          <Heart className="w-9 h-9 text-white" strokeWidth={2.5} fill="white" />
        </button>
      </div>
    </div>
  );
}