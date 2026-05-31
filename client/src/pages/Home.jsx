import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import CreatePost from '../components/Feed/CreatePost';
import PostCard from '../components/Feed/PostCard';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Use the smart feed endpoint (prioritizes followed users)
      const { data } = await axios.get('/posts/feed');
      setPosts(data);
    } catch (err) {
      console.error(err);
      // Fallback to all posts if feed fails
      try {
        const { data } = await axios.get('/posts');
        setPosts(data);
      } catch (fallbackErr) {
        console.error('Feed fallback also failed:', fallbackErr);
        setPosts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Feed</h2>
        <p className="text-white/40">Catch up with the community.</p>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode='popLayout'>
          {posts.map((post) => (
            <motion.div
              key={post._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <PostCard post={post} onDelete={handlePostDeleted} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-white/30 text-lg">No vibes yet. Be the first!</p>
        </div>
      )}
    </MainLayout>
  );
};

export default Home;
