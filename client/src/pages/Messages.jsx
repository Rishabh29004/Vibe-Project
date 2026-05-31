import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, Search, User, MessageSquare, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

import { useLocation } from 'react-router-dom';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    if (socket) {
      console.log('Socket instance exists:', socket.id);
      socket.on('connect', () => console.log('Socket connected!'));
      socket.on('connect_error', (err) => console.error('Socket connect error:', err));
    } else {
      console.log('Socket instance is null');
    }
  }, [socket]);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchConversations().then(() => {
        // If navigated here with a user to start a chat with
        if (location.state?.startChatWith) {
          const targetUser = location.state.startChatWith;
          // Check if conversation already exists
          const existing = conversations.find(c => 
            c.participants.some(p => p._id === targetUser._id)
          );
          
          if (existing) {
            setActiveChat(existing);
          } else {
            // Create a temp chat object
            setActiveChat({
              _id: 'temp-' + Date.now(),
              participants: [user, targetUser],
              temp: true
            });
            setMessages([]);
          }
        }
      });
    }
  }, [user, location.state]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get('/chat/conversations');
      setConversations(data);
    } catch (err) {
      console.error(err);
      // Mock conversations
      setConversations([
        {
          _id: 'conv1',
          participants: [
            { _id: 'me', username: 'VibeExplorer' },
            { _id: 'u1', username: 'Nova_Prime', profilePicture: '' }
          ],
          lastMessage: { text: 'Welcome to the future of social!' }
        },
        {
          _id: 'conv2',
          participants: [
            { _id: 'me', username: 'VibeExplorer' },
            { _id: 'u2', username: 'Echo_System', profilePicture: '' }
          ],
          lastMessage: { text: 'Did you see the latest post?' }
        }
      ]);
    }
  };

  const fetchMessages = async (id) => {
    if (!id || id.startsWith('temp-')) return;
    try {
      const { data } = await axios.get(`/chat/${id}`);
      setMessages(data);
    } catch (err) {
      console.error(err);
      // Mock messages fallback
      setMessages([]);
    }
  };

  useEffect(() => {
    if (activeChat && !activeChat.temp) {
      fetchMessages(activeChat._id);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  useEffect(() => {
    if (socket) {
      console.log('Attaching newMessage listener');
      socket.on('newMessage', (message) => {
        console.log('Received message via socket:', message);
        // Compare IDs as strings to avoid object mismatch
        if (activeChat && message.conversationId.toString() === activeChat._id.toString()) {
          setMessages(prev => [...prev, message]);
        }
        fetchConversations();
      });
      return () => {
        console.log('Removing newMessage listener');
        socket.off('newMessage');
      };
    }
  }, [socket, activeChat?._id]); // Add activeChat._id to dependencies

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleEmojiClick = (emojiData) => {
  setNewMessage((prev) => prev + emojiData.emoji);
};

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user) return;

    const recipient = activeChat.participants.find(p => p._id !== user._id);
    if (!recipient) return;
    
    try {
      const { data } = await axios.post('/chat/send', {
        recipientId: recipient._id,
        text: newMessage
      });
      
      setMessages([...messages, data]);
      setNewMessage('');
      setShowEmojiPicker(false);
      
      // If it was a temp chat, refresh conversations to get the real one
      if (activeChat.temp) {
        const { data: convs } = await axios.get('/chat/conversations');
        setConversations(convs);
        const newRealChat = convs.find(c => c.participants.some(p => p._id === recipient._id));
        if (newRealChat) setActiveChat(newRealChat);
      }
      
      if (socket) {
        socket.emit('sendMessage', { ...data, recipientId: recipient._id });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <MainLayout><div className="text-center py-20 text-white/40">Please login to view messages.</div></MainLayout>;

  return (
    <MainLayout>
      <div className="flex gap-6 h-[calc(100vh-160px)]">
        {/* Conversation List */}
        <div className="w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold">Messages</h2>
          </div>
          
          <div className="relative">
            <Input placeholder="Search chats..." className="pl-10" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {conversations.map(conv => {
              const otherUser = conv.participants.find(p => p._id !== user._id);
              if (!otherUser) return null;
              const isOnline = onlineUsers.includes(otherUser._id);
              
              return (
                <div
                  key={conv._id}
                  onClick={() => setActiveChat(conv)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-3 ${
                    activeChat?._id === conv._id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'glass-panel hover:bg-white/5'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                      {otherUser.profilePicture ? (
                        <img src={otherUser.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold">{otherUser.username?.[0]?.toUpperCase()}</div>
                      )}
                    </div>
                    {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold truncate">{otherUser.username}</h4>
                    </div>
                    <p className="text-xs text-white/40 truncate">{conv.lastMessage?.text || 'No messages yet'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden border-white/5">
          {activeChat ? (
            <>
              {/* Chat Header */}
              {(() => {
                const otherUser = activeChat.participants.find(p => p._id !== user._id);
                return (
                  <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                      {otherUser?.profilePicture ? (
                        <img src={otherUser.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><User size={20} /></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold">{otherUser?.username || 'User'}</h4>
                      <p className="text-[10px] text-green-500 uppercase tracking-widest font-bold">
                        {onlineUsers.includes(otherUser?._id) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => {
                  const isMine = msg.sender === user._id;
                  return (
                    <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                        isMine 
                          ? 'bg-primary text-background font-medium' 
                          : 'bg-white/5 text-white border border-white/10'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form
  onSubmit={handleSendMessage}
  className="relative p-4 border-t border-white/5 bg-white/[0.02] flex gap-3 items-center"
>

  {showEmojiPicker && (
    <div className="absolute bottom-20 right-20 z-50">
      <EmojiPicker
        onEmojiClick={handleEmojiClick}
        theme="dark"
      />
    </div>
  )}

  <Input
    placeholder="Type a message..."
    className="bg-white/5"
    value={newMessage}
    onChange={(e) => setNewMessage(e.target.value)}
  />

  <button
    type="button"
    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition"
  >
    <Smile size={20} />
  </button>

  <Button
    type="submit"
    size="icon"
    className="w-12 h-12 flex-shrink-0"
  >
    <Send size={20} />
  </Button>

</form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20 p-10 text-center">
              <MessageSquare size={48} className="mb-4 opacity-10" />
              <h3 className="text-xl font-bold text-white/40">Select a conversation</h3>
              <p className="max-w-xs">Connect with your community in real-time vibes.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
