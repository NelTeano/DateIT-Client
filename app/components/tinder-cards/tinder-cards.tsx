'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Heart, X, MapPin, Briefcase, Info, Calendar } from 'lucide-react';

interface Card {
  id: number;
  name: string;
  age: number;
  photoUrl: string;
  bio: string;
  gender: string;
  location?: string;
  occupation?: string;
}

// Sample data matching your user schema
const cardData: Card[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    age: 25,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop',
    bio: 'Love hiking, coffee, and meeting new people! Adventure seeker and coffee enthusiast ☕🌄',
    gender: 'female',
    location: 'New York, NY',
    occupation: 'Photographer'
  },
  {
    id: 2,
    name: 'Emma Wilson',
    age: 27,
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop',
    bio: 'Foodie | Traveler | Dog lover. Always looking for the next great restaurant 🐕✈️🍕',
    gender: 'female',
    location: 'Los Angeles, CA',
    occupation: 'Chef'
  },
  {
    id: 3,
    name: 'Michael Chen',
    age: 28,
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=800&fit=crop',
    bio: 'Fitness enthusiast and music lover. Let\'s catch a concert together! 🎸💪',
    gender: 'male',
    location: 'Chicago, IL',
    occupation: 'Personal Trainer'
  },
  {
    id: 4,
    name: 'Jessica Martinez',
    age: 24,
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop',
    bio: 'Beach lover and yoga instructor. Finding peace in every pose 🧘‍♀️🌊',
    gender: 'female',
    location: 'Miami, FL',
    occupation: 'Yoga Instructor'
  },
  {
    id: 5,
    name: 'David Park',
    age: 29,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
    bio: 'Tech geek | Coffee addict | Cat dad. Building the future one line at a time 🐱💻',
    gender: 'male',
    location: 'Seattle, WA',
    occupation: 'Software Engineer'
  },
];

type DragEventType = React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>;

export default function TinderCards() {
  const [cards, setCards] = useState<Card[]>(cardData);
  const [status, setStatus] = useState<'love' | 'nope' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const removeCard = (isLove: boolean) => {
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

  return (
    <div className="w-full h-full overflow-hidden flex flex-col relative">
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
              key={card.id}
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
                  src={card.photoUrl}
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
                    {card.location && (
                      <div className="flex items-center gap-2 text-sm pointer-events-none drop-shadow">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{card.location}</span>
                      </div>
                    )}
                    
                    {card.occupation && (
                      <div className="flex items-center gap-2 text-sm pointer-events-none drop-shadow">
                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                        <span>{card.occupation}</span>
                      </div>
                    )}
                    
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
                  {card.bio}
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
              <p className="text-gray-500 text-center px-8">Check back later for new matches!</p>
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