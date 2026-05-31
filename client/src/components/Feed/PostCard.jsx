import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MoreHorizontal, Zap, Trash2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5001';

const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http')) return url;
  return `${SERVER_URL}${url}`;
};

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [isLiked, setIsLiked] = useState(likes.includes(user?._id));
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  const isOwnPost = post.user?._id === user?._id;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      const { data } = await axios.post(`/posts/${post._id}/like`);
      setLikes(data.likes);
    } catch (err) {
      console.error(err);
      setIsLiked(isLiked); // Rollback on error
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this vibe? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await axios.delete(`/posts/${post._id}`);
      setDeleted(true);
      if (onDelete) onDelete(post._id);
    } catch (err) {
      console.error('Failed to delete post:', err);
      setDeleting(false);
    }
  };

  if (deleted) return null;

  return (
    <GlassCard className="mb-6 group">
      <div className="flex gap-4">
        <Link to={`/profile/${post.user?._id}`} className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all">
          {post.user?.profilePicture ? (
            <img src={post.user.profilePicture} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary font-bold">
              {post.user?.username?.[0]?.toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Link to={`/profile/${post.user?._id}`} className="font-bold text-white hover:text-primary cursor-pointer transition-colors">
                {post.user?.username}
              </Link>
              <p className="text-xs text-white/30">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Only show menu on own posts */}
            {isOwnPost && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className="text-white/30 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                >
                  <MoreHorizontal size={20} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-8 z-50 w-40 glass-panel rounded-xl border border-white/10 overflow-hidden shadow-xl"
                    >
                      <button
                        onClick={() => { setMenuOpen(false); handleDelete(); }}
                        disabled={deleting}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={15} />
                        {deleting ? 'Deleting…' : 'Delete Post'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <p className="text-white/80 leading-relaxed mb-4 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Media Rendering */}
          {post.media?.length > 0 && (
            <div className={`rounded-2xl overflow-hidden border border-white/10 mb-4 bg-white/5 ${
              post.media.length === 1 ? 'aspect-auto' : 'grid grid-cols-2 gap-2 aspect-square'
            }`}>
              {post.media.map((item, index) => (
                <div key={index} className="relative group overflow-hidden">
                  {item.type === 'image' ? (
                    <img 
                      src={getMediaUrl(item.url)} 
                      alt="Post media" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <video src={getMediaUrl(item.url)} controls className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 pt-4 border-t border-white/5">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-primary' : 'text-white/30 hover:text-white'}`}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm">{likes.length}</span>
            </button>
            
            <div className="ml-auto">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-1 text-[10px] uppercase font-bold text-primary/50 tracking-widest"
              >
                <Zap size={12} />
                Vibe Check
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default PostCard;
