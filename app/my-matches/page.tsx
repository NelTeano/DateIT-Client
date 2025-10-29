'use client';
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Calendar, ArrowRight, RefreshCw, Search, AlertCircle } from 'lucide-react';

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

  // Fetch matches on component mount
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
        // Your backend returns { success: true, matches: [...] }
        setMatches(data.matches || []);
        
        // Fetch unread counts for each match
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

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const handleOpenChat = (matchId) => {
    // Navigate to chat room - adjust based on your routing setup
    window.location.href = `/chat?matchId=${matchId}`;
    // Or if using Next.js router: router.push(`/chat?matchId=${matchId}`)
    // Or React Router: navigate(`/chat?matchId=${matchId}`)
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery ? 'No matches found' : 'No matches yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Try adjusting your search' 
                : 'Start swiping to find your perfect match!'}
            </p>
            {!searchQuery && (
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition">
                Start Swiping
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => {
              const otherUser = getOtherUser(match);
              const unreadCount = unreadCounts[match._id] || 0;

              return (
                <div
                  key={match._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                  onClick={() => handleOpenChat(match._id)}
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Profile Picture */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={otherUser?.profilePicture || 'https://via.placeholder.com/80'}
                          alt={otherUser?.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-pink-200"
                        />
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {otherUser?.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>Matched {formatDate(match.createdAt)}</span>
                        </div>
                        {unreadCount > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <MessageCircle className="w-4 h-4 text-pink-500" />
                            <span className="text-sm font-medium text-pink-600">
                              {unreadCount} new {unreadCount === 1 ? 'message' : 'messages'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChat(match._id);
                        }}
                        className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Hover Effect Border */}
                  <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Card */}
        {matches.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" fill="currentColor" />
                <p className="text-2xl font-bold text-gray-800">{matches.length}</p>
                <p className="text-xs text-gray-600">Total Matches</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">
                  {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
                </p>
                <p className="text-xs text-gray-600">Unread Messages</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg col-span-2 md:col-span-1">
                <Calendar className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">
                  {matches.filter(m => {
                    const diffTime = Math.abs(new Date() - new Date(m.createdAt));
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays === 0;
                  }).length}
                </p>
                <p className="text-xs text-gray-600">New Today</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}