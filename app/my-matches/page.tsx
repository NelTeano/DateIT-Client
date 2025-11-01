'use client';
import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Calendar, ArrowRight, RefreshCw, Search, AlertCircle, Check, X, Trash2, AlertTriangle } from 'lucide-react';
import Header from '../components/header/header';
import MobileNav from '../components/mobile-nav/mobile-nav';

export default function MyMatches() {
  const [matches, setMatches] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [processingRequest, setProcessingRequest] = useState(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [matchedUserName, setMatchedUserName] = useState("");
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [unmatchLoading, setUnmatchLoading] = useState(false);
  
  const API_URL = `${process.env.NEXT_PUBLIC_PROD_API_URL}/api`;
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

    fetchMatches(true); // Initial load
    fetchPendingRequests(true); // Initial load

    const interval = setInterval(() => {
      fetchMatches(false); // Silent refresh
      fetchPendingRequests(false); // Silent refresh
    }, 10000);

    return () => clearInterval(interval);
  }, [token, currentUserId]);

  const fetchMatches = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError('');

      const response = await fetch(`${API_URL}/matches/my-matches`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch matches');
      }

      if (data.success) {
        const allMatches = data.matches || [];
        setMatches(allMatches);
        
        if (allMatches && allMatches.length > 0) {
          allMatches.forEach(match => {
            if (match.status === 'active') {
              fetchUnreadCount(match._id);
            }
          });
        }
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      if (isInitialLoad) {
        setError(err.message || 'Failed to load matches. Please try again.');
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const fetchPendingRequests = async (isInitialLoad = false) => {
    try {
      const response = await fetch(`${API_URL}/matches/pending-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPendingRequests(data.pendingRequests || []);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  };

  const handleAcceptRequest = async (matchId, userId) => {
    try {
      setProcessingRequest(matchId);

      const response = await fetch(`${API_URL}/matches/accept/${matchId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const otherUserName =
          data.match.user1._id === currentUserId
            ? data.match.user2.name
            : data.match.user1.name;

        setMatchedUserName(otherUserName);
        setShowMatchPopup(true);

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        alert(data.message || 'Failed to accept request');
      }
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Failed to accept request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (matchId) => {
    try {
      setProcessingRequest(matchId);
      
      const response = await fetch(`${API_URL}/matches/reject/${matchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPendingRequests(prev => prev.filter(req => req._id !== matchId));
      } else {
        alert(data.message || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request. Please try again.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleUnmatchClick = (match) => {
    setSelectedMatch(match);
    setShowUnmatchModal(true);
  };

  const handleConfirmUnmatch = async () => {
    if (!selectedMatch) return;

    try {
      setUnmatchLoading(true);

      const response = await fetch(`${API_URL}/matches/${selectedMatch._id}/end`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMatches(prev => prev.filter(match => match._id !== selectedMatch._id));
        setShowUnmatchModal(false);
        setSelectedMatch(null);
      } else {
        alert(data.message || 'Failed to unmatch');
      }
    } catch (err) {
      console.error('Error unmatching:', err);
      alert('Failed to unmatch. Please try again.');
    } finally {
      setUnmatchLoading(false);
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
    await Promise.all([fetchMatches(false), fetchPendingRequests(false)]);
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
          <Header />
      <main className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <MobileNav />
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
                    {pendingRequests.length > 0 && ` • ${pendingRequests.length} pending`}
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

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {pendingRequests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                Pending Requests ({pendingRequests.length})
              </h2>
              <div className="grid gap-4">
                {pendingRequests.map((request) => {
                  const otherUser = getOtherUser(request);
                  if (!otherUser) return null;

                  return (
                    <div
                      key={request._id}
                      className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl shadow-lg p-6 border-2 border-pink-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {otherUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Heart className="w-3 h-3 text-white" fill="white" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {otherUser.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Liked you {formatDate(request.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectRequest(request._id)}
                            disabled={processingRequest === request._id}
                            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform active:scale-95 border-2 border-red-100 disabled:opacity-50"
                          >
                            <X className="w-6 h-6 text-red-500" />
                          </button>
                          <button
                            onClick={() => handleAcceptRequest(request._id, otherUser._id)}
                            disabled={processingRequest === request._id}
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg flex items-center justify-center hover:scale-110 transition-transform active:scale-95 disabled:opacity-50"
                          >
                            {processingRequest === request._id ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Check className="w-6 h-6 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Active Matches ({matches.length})
            </h2>
            {filteredMatches.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-10 h-10 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {searchQuery ? 'No matches found' : 'No active matches yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search query'
                    : pendingRequests.length > 0
                    ? 'Accept pending requests to start chatting!'
                    : 'Start swiping to find your perfect match!'
                  }
                </p>
                {!searchQuery && pendingRequests.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/match'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
                  >
                    Start Swiping
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                 {filteredMatches.map((match) => {
                    const otherUser = getOtherUser(match);
                    if (!otherUser) return null;

                    const isEnded = match.status === 'ended';
                    const endedByMe = match.endedBy === currentUserId;

                    return (
                      <div
                        key={match._id}
                        className={`bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 ${
                          isEnded ? 'opacity-60 border-2 border-red-200' : ''
                        }`}
                      >
                        {isEnded && (
                          <div className="mb-3 flex items-center justify-center">
                            <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                              <X className="w-4 h-4" />
                              Match Ended {endedByMe ? '(by you)' : `(by ${otherUser.name})`}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <div 
                            className={`relative ${!isEnded ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                            onClick={() => !isEnded && handleOpenChat(match._id)}
                          >
                            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {otherUser.name.charAt(0).toUpperCase()}
                            </div>
                            {!isEnded && unreadCounts[match._id] > 0 && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">
                                  {unreadCounts[match._id] > 9 ? '9+' : unreadCounts[match._id]}
                                </span>
                              </div>
                            )}
                          </div>

                          <div 
                            className={`flex-1 min-w-0 ${!isEnded ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                            onClick={() => !isEnded && handleOpenChat(match._id)}
                          >
                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                              {otherUser.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {isEnded 
                                  ? `Ended ${formatDate(match.endedAt || match.updatedAt)}`
                                  : `Matched ${formatDate(match.createdAt)}`
                                }
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {!isEnded && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnmatchClick(match);
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                  title="Unmatch"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenChat(match._id);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
                                >
                                  <MessageCircle className="w-5 h-5" />
                                  <span className="hidden sm:inline">Chat</span>
                                </button>
                              </>
                            )}
                            {isEnded && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenChat(match._id);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                              >
                                <MessageCircle className="w-5 h-5" />
                                <span className="hidden sm:inline">View Chat</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </main>

      {showMatchPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full animate-pop-in relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <Heart
                  key={i}
                  className="absolute text-pink-400 opacity-40 animate-float"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-8 h-8 text-white" fill="white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                💖 It's a Match!
              </h2>
              <p className="text-gray-600 mb-4">
                You're now matched with <span className="font-semibold text-pink-600">{matchedUserName}</span>!
              </p>
              <button
                onClick={() => setShowMatchPopup(false)}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnmatchModal && selectedMatch && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Unmatch {getOtherUser(selectedMatch)?.name}?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              This will permanently remove your match and conversation. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUnmatchModal(false);
                  setSelectedMatch(null);
                }}
                disabled={unmatchLoading}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnmatch}
                disabled={unmatchLoading}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {unmatchLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Unmatching...
                  </>
                ) : (
                  'Unmatch'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}