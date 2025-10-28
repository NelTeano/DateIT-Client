'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Heart, X } from 'lucide-react';

interface Card {
  id: number;
  image: string;
  title: string;
  description: string;
}

const cardData: Card[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=300&fit=crop',
    title: 'Demo card 1',
    description: 'This is a demo for Tinder like swipe cards',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=300&fit=crop',
    title: 'Demo card 2',
    description: 'This is a demo for Tinder like swipe cards',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=300&fit=crop',
    title: 'Demo card 3',
    description: 'This is a demo for Tinder like swipe cards',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=300&fit=crop',
    title: 'Demo card 4',
    description: 'This is a demo for Tinder like swipe cards',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=300&fit=crop',
    title: 'Demo card 5',
    description: 'This is a demo for Tinder like swipe cards',
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

    const scale = (20 - index) / 20;
    const translateY = -30 * index;
    const opacity = (10 - index) / 10;

    return {
      transform: `scale(${scale}) translateY(${translateY}px)`,
      opacity,
      zIndex: cards.length - index,
    };
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col relative bg-gradient-to-br from-cyan-100 to-blue-100">
      {/* Status indicators */}
      <div className="absolute top-1/2 -mt-12 w-full text-center pointer-events-none z-20">
        <X
          className={`absolute left-1/2 -ml-12 w-24 h-24 text-gray-400 transition-all duration-200 ${
            status === 'nope' ? 'opacity-70 scale-100' : 'opacity-0 scale-30'
          }`}
          strokeWidth={3}
        />
        <Heart
          className={`absolute left-1/2 -ml-12 w-24 h-24 text-pink-300 transition-all duration-200 ${
            status === 'love' ? 'opacity-70 scale-100' : 'opacity-0 scale-30'
          }`}
          strokeWidth={3}
          fill="currentColor"
        />
      </div>

      {/* Cards container */}
      <div className="flex-grow pt-10 flex justify-center items-end z-10">
        <div className="relative w-[90vw] max-w-md h-[70vh]">
          {cards.map((card, index) => (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}              
              className="absolute inset-0 bg-white rounded-lg overflow-hidden shadow-xl transition-all duration-300 ease-in-out"
              style={getCardStyle(index)}
              onMouseDown={index === 0 ? handleDragStart : undefined}
              onTouchStart={index === 0 ? handleDragStart : undefined}
              onTouchMove={index === 0 ? handleDragMove : undefined}
              onTouchEnd={index === 0 ? handleDragEnd : undefined}
            >
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-48 object-cover pointer-events-none select-none"
                draggable={false}
              />
              <div className="p-4">
                <h3 className="text-2xl font-bold mb-4 pointer-events-none">{card.title}</h3>
                <p className="text-lg text-gray-600 pointer-events-none">{card.description}</p>
              </div>
            </div>
          ))}

          {cards.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-2xl text-gray-400">Wait Finding Your Soon to be Lover!</p>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-shrink-0 h-24 flex justify-center items-start pt-5 gap-4">
        <button
          onClick={() => handleButtonClick(false)}
          className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 focus:outline-none"
          disabled={cards.length === 0}
        >
          <X className="w-8 h-8 text-gray-400" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => handleButtonClick(true)}
          className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 focus:outline-none"
          disabled={cards.length === 0}
        >
          <Heart className="w-8 h-8 text-pink-300" strokeWidth={2.5} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
