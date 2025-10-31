'use client';
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Calendar, ArrowRight, RefreshCw, Search, AlertCircle } from 'lucide-react';
import Header from '../components/header/header';
import MobileNav from '../components/mobile-nav/mobile-nav';

export default function MyMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});

  const API_URL = 'http://localhost:3100/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const currentUserId = typeof window !== 'undefined' ? (() => {
    const userDetails = localStorage.getItem('userDetails');
    if (userDetails) {
      try {
        const parsed = JSON.parse(userDetails);
        return parsed.user?._id || parsed._id || null;
      } catch {
        return null;
      }
    }
    return null;
  })() : null;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Please login to view your matches');
      return;
    }
    if (!currentUserId) {
      setLoading(false);
      setError('User ID not found. Please login again.');
      return;
    }
    fetchMatches();
  }, [token, currentUserId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching matches with token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${API_URL}/matches/my-matches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Matches response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch matches');
      }

      if (data.success) {
        setMatches(data.matches || []);
        if (data.matches && data.matches.length > 0) {
          data.matches.forEach(match => {
            fetchUnreadCount(match._id);
          });
        }
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.message || 'Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async (matchId) => {
    try {
      const response = await fetch(`${API_URL}/chat/${matchId}/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUnreadCounts(prev => ({
          ...prev,
          [matchId]: data.unreadCount
        }));
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  };

  const getOtherUser = (match) => {
    if (!match || !currentUserId) return null;
    return match.user1._id === currentUserId ? match.user2 : match.user1;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleOpenChat = (matchId) => {
    window.location.href = `/chat?matchId=${matchId}`;
  };

  const filteredMatches = matches.filter(match => {
    if (!searchQuery) return true;
    const otherUser = getOtherUser(match);
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Heart className="w-12 h-12 text-pink-500" />
          <p className="text-gray-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col relative">
      {/* Header */}
      <Header />

      {/* Page Content */}
      <main className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* ===== Your Existing Matches UI ===== */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" fill="white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">My Matches</h1>
                  <p className="text-sm text-gray-600">
                    {matches.length} {matches.length === 1 ? 'active match' : 'active matches'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search matches..."
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Matches List */}
          {/* (Your existing matches rendering code remains unchanged) */}
          {/* ... */}
        </div>
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
