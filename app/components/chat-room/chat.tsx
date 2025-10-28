import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical, Heart, AlertCircle } from 'lucide-react';
// import { useSocket } from '../context/SocketContext';


export default function ChatRoom() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [matchData, setMatchData] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [matchEnded, setMatchEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  // const { socket, isConnected } = useSocket();

  // Mock data - replace with actual API calls and match ID from URL
  const currentUserId = 'user1';
  const matchId = 'match123';

  useEffect(() => {
    // Simulate loading match data
    setTimeout(() => {
      setMatchData({
        _id: 'match123',
        user1: { _id: 'user1', name: 'You', profilePicture: 'https://via.placeholder.com/150' },
        user2: { _id: 'user2', name: 'Sarah Johnson', profilePicture: 'https://via.placeholder.com/150' },
        status: 'active'
      });
      
      // Simulate loading messages
      setMessages([
        {
          _id: '1',
          sender: { _id: 'user2', name: 'Sarah Johnson' },
          content: 'Hey! Nice to match with you 😊',
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          _id: '2',
          sender: { _id: 'user1', name: 'You' },
          content: 'Hi Sarah! I loved your profile. What do you like to do for fun?',
          createdAt: new Date(Date.now() - 3000000)
        },
        {
          _id: '3',
          sender: { _id: 'user2', name: 'Sarah Johnson' },
          content: 'I love hiking and trying new restaurants! How about you?',
          createdAt: new Date(Date.now() - 2400000)
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [matchId]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !matchId) return;

    socket.emit('match:join', matchId);

    socket.on('message:received', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('match:status', (data) => {
      if (data.status === 'ended') {
        setMatchEnded(true);
        setMatchData(prev => ({ ...prev, status: 'ended' }));
      }
    });

    socket.on('typing:user', (data) => {
      if (data.userId !== currentUserId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socket.emit('match:leave', matchId);
      socket.off('message:received');
      socket.off('match:status');
      socket.off('typing:user');
    };
  }, [socket, matchId, currentUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || matchEnded) return;

    const messageData = {
      matchId,
      content: newMessage.trim(),
      receiverId: matchData.user2._id
    };

    try {
      // Send to API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_TOKEN_HERE`
        },
        body: JSON.stringify(messageData)
      });

      const data = await response.json();
      
      if (data.success) {
        setNewMessage('');
        // Socket will handle adding message to UI
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (socket && !matchEnded) {
      socket.emit('typing:start', { matchId, userId: currentUserId });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { matchId, userId: currentUserId });
      }, 1000);
    }
  };

  const handleEndMatch = async () => {
    if (!window.confirm('Are you sure you want to end this match? You will no longer be able to chat.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches/${matchId}/end`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer YOUR_TOKEN_HERE`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMatchEnded(true);
      }
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getOtherUser = () => {
    if (!matchData) return null;
    return matchData.user1._id === currentUserId ? matchData.user2 : matchData.user1;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-pulse">
          <Heart className="w-12 h-12 text-pink-500" />
        </div>
      </div>
    );
  }

  const otherUser = getOtherUser();

  return (
    <div className="flex flex-col h-screen bg-white max-w-2xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.history.back()}
            className="hover:bg-white/20 rounded-full p-2 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img 
            src={otherUser?.profilePicture} 
            alt={otherUser?.name}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <h2 className="font-semibold">{otherUser?.name}</h2>
            {isConnected && (
              <p className="text-xs text-pink-100">
                {isTyping ? 'typing...' : 'online'}
              </p>
            )}
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="hover:bg-white/20 rounded-full p-2 transition"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
              <button
                onClick={handleEndMatch}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition"
              >
                End Match
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Match Ended Banner */}
      {matchEnded && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">
            This match has ended. You can no longer send messages.
          </p>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => {
          const isCurrentUser = message.sender._id === currentUserId;
          
          return (
            <div
              key={message._id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                {!isCurrentUser && (
                  <img
                    src={message.sender.profilePicture || 'https://via.placeholder.com/40'}
                    alt={message.sender.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                
                <div>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'bg-white text-gray-800 shadow'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right' : ''}`}>
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        {matchEnded ? (
          <div className="text-center text-gray-500 py-2">
            Chat is disabled because the match has ended
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows="1"
                style={{ maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full p-3 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}