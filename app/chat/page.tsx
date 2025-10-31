'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';

interface Message {
  _id: string;
  matchId: string;
  sender: { _id: string; name: string; profilePicture?: string };
  receiver: { _id: string; name: string; profilePicture?: string };
  content: string;
  read: boolean;
  createdAt: string;
}

interface Match {
  _id: string;
  user1: { _id: string; name: string; profilePicture?: string };
  user2: { _id: string; name: string; profilePicture?: string };
  status: string;
}

// Loading fallback component
function ChatLoadingFallback() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="flex items-center justify-center h-full gap-3">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading chat...</p>
      </div>
    </div>
  );
}

// Main chat component with search params
function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const matchId = searchParams.get('matchId');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{ name: string; profilePicture?: string } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // Get token and current user info from localStorage
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

  // Track if user is at the bottom of the chat
  const handleScroll = (e: any) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 100;
    isAtBottomRef.current = bottom;
  };

  // Scroll to bottom when new messages arrive (only if user was already at bottom)
  useEffect(() => {
    if (isAtBottomRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch messages function
  const fetchMessages = async (isInitialLoad = false) => {
    if (!matchId || !token) return;

    try {
      if (isInitialLoad) {
        setLoading(true);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/chat/${matchId}?page=1&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
        
        // Get other user info from match data
        if (data.match && currentUserId) {
          const match: Match = data.match;
          const isUser1 = match.user1._id === currentUserId;
          const otherUserData = isUser1 ? match.user2 : match.user1;
          
          setOtherUserId(otherUserData._id);
          setOtherUser({
            name: otherUserData.name,
            profilePicture: otherUserData.profilePicture
          });
        }
        // Fallback: Get from first message if match data not available
        else if (data.messages.length > 0 && currentUserId) {
          const firstMsg = data.messages[0];
          const isMessageFromMe = firstMsg.sender._id === currentUserId;
          const otherUserData = isMessageFromMe ? firstMsg.receiver : firstMsg.sender;
          
          setOtherUserId(otherUserData._id);
          setOtherUser({
            name: otherUserData.name,
            profilePicture: otherUserData.profilePicture
          });
        }
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMessages(true);
  }, [matchId, token, currentUserId]);

  // Auto-refresh every 7 seconds
  useEffect(() => {
    if (!matchId || !token) return;

    const intervalId = setInterval(() => {
      fetchMessages(false);
    }, 7000);

    return () => clearInterval(intervalId);
  }, [matchId, token]);

  // Mark messages as read when user views the chat
  useEffect(() => {
    if (!matchId || !token || !currentUserId || messages.length === 0) return;

    const hasUnreadMessagesForMe = messages.some(
      msg => msg.receiver._id === currentUserId && !msg.read
    );

    if (hasUnreadMessagesForMe) {
      markMessagesAsRead();
    }
  }, [messages, matchId, token, currentUserId]);

  const markMessagesAsRead = async () => {
    if (!matchId || !token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/chat/${matchId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.receiver._id === currentUserId && !msg.read
              ? { ...msg, read: true }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Send a message
  const handleSend = async () => {
    if (!newMessage.trim() || !matchId || !token || !otherUserId) {
      return;
    }

    try {
      setSending(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId,
          content: newMessage,
          receiverId: otherUserId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        console.error('Send failed:', data.message);
        alert(`Failed to send message: ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Get other user's name for header
  const otherUserName = otherUser?.name || 'Chat';
  const otherUserInitial = otherUserName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-pink-100 shadow-sm">
        <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-pink-50 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              {otherUser?.profilePicture ? (
                <img
                  src={otherUser.profilePicture}
                  alt={otherUserName}
                  className="w-10 h-10 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md">
                  {otherUserInitial}
                </div>
              )}
              <div>
                <h1 className="font-semibold text-gray-900">{otherUserName}</h1>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
            </div>
          </div>
          <button
            className="p-2 hover:bg-pink-50 rounded-full transition-colors"
            aria-label="More options"
          >
            <MoreVertical size={20} className="text-gray-700" />
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <main 
        className="flex-1 overflow-y-auto p-4 max-w-4xl w-full mx-auto"
        onScroll={handleScroll}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
              <Send size={32} className="text-pink-600" />
            </div>
            <div className="text-center">
              <p className="text-gray-600 font-medium text-lg">No messages yet</p>
              <p className="text-gray-400 text-sm mt-1">Start the conversation with {otherUserName}!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((msg, index) => {
              const isMine = currentUserId && msg.sender._id === currentUserId;
              const showDateSeparator = index === 0 || 
                new Date(messages[index - 1].createdAt).toDateString() !== 
                new Date(msg.createdAt).toDateString();
              
              return (
                <div key={msg._id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-6">
                      <div className="bg-pink-100 text-pink-700 text-xs px-3 py-1 rounded-full font-medium">
                        {new Date(msg.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: new Date(msg.createdAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                        })}
                      </div>
                    </div>
                  )}
                  <div
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                      {!isMine && (
                        <p className="text-xs font-medium text-gray-500 mb-1 ml-3">
                          {msg.sender.name}
                        </p>
                      )}
                      <div
                        className={`px-4 py-2.5 rounded-2xl break-words ${
                          isMine
                            ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-br-md shadow-md'
                            : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-pink-100'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.content}</p>
                        <div className="flex items-center justify-between gap-2 mt-1.5">
                          <p
                            className={`text-xs ${isMine ? 'text-pink-100' : 'text-gray-400'}`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          {isMine && (
                            <div className="flex items-center">
                              {msg.read ? (
                                <div className="flex">
                                  <svg
                                    className="w-4 h-4 text-pink-100"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <svg
                                    className="w-4 h-4 text-pink-100 -ml-2"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              ) : (
                                <svg
                                  className="w-4 h-4 text-pink-100"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}
      </main>

      {/* Enhanced Input Footer */}
      <footer className="bg-white border-t border-pink-100 shadow-lg">
        <div className="flex items-end gap-2 p-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              className="w-full border border-pink-200 rounded-3xl px-5 py-3 pr-4 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-pink-50 focus:bg-white"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={!otherUserId || sending}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim() || !otherUserId}
            className={`p-3 rounded-full transition-all transform active:scale-95 shadow-md ${
              newMessage.trim() && !sending && otherUserId
                ? 'bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

// Main export with Suspense boundary
export default function ChatPage() {
  return (
    <Suspense fallback={<ChatLoadingFallback />}>
      <ChatPageContent />
    </Suspense>
  );
}