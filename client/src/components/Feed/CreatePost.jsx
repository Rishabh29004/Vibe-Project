import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Video, Send, Smile, X } from 'lucide-react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import GlassCard from '../ui/GlassCard';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setContent(prev => prev + emojiData.emoji);
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedImage) return;
    setIsLoading(true);
    try {
      const media = selectedImage ? [{ url: selectedImage, type: 'image' }] : [];
      const { data } = await axios.post('/posts', { content, media });
      onPostCreated(data);
      setContent('');
      setSelectedImage(null);
      setIsExpanded(false);
      setShowEmojiPicker(false);
    } catch (err) {
      console.error(err);
      // Fallback for Demo Mode
      const mockPost = {
        _id: Math.random().toString(36).substr(2, 9),
        user: { 
          username: user?.username || 'VibeExplorer', 
          profilePicture: user?.profilePicture || '' 
        },
        content: content,
        media: selectedImage ? [{ url: selectedImage, type: 'image' }] : [],
        likes: [],
        createdAt: new Date().toISOString()
      };
      onPostCreated(mockPost);
      setContent('');
      setSelectedImage(null);
      setIsExpanded(false);
      setShowEmojiPicker(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <GlassCard className="mb-8 overflow-visible relative">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-neon-gradient p-[2px] flex-shrink-0">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-primary font-bold">{user?.username?.[0]?.toUpperCase()}</div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What's the vibe today?"
            className="w-full bg-transparent border-none focus:ring-0 text-lg placeholder:text-white/20 resize-none min-h-[60px]"
          />

          {selectedImage && (
            <div className="relative mt-4 mb-4 group">
              <img src={selectedImage} alt="Selected" className="max-h-[300px] w-full object-cover rounded-2xl border border-white/10" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/5">
                  <div className="flex gap-2 relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.1 }} 
                      onClick={() => fileInputRef.current.click()}
                      className="p-2 rounded-lg text-primary hover:bg-primary/10"
                    >
                      <ImageIcon size={20} />
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.1 }} 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 rounded-lg text-accent hover:bg-accent/10"
                    >
                      <Smile size={20} />
                    </motion.button>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsExpanded(false);
                        setShowEmojiPicker(false);
                        setSelectedImage(null);
                        setContent('');
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handlePost}
                      disabled={(!content.trim() && !selectedImage) || isLoading}
                    >
                      {isLoading ? 'Posting...' : 'Post Vibe'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GlassCard>

      {/* Emoji Picker - rendered outside the card to avoid clipping */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-[9999]" onClick={() => setShowEmojiPicker(false)}>
          <div 
            className="absolute left-[220px] top-[220px]"
            onClick={(e) => e.stopPropagation()}
          >
            <EmojiPicker 
              theme="dark" 
              onEmojiClick={handleEmojiClick}
              width={320}
              height={400}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;
