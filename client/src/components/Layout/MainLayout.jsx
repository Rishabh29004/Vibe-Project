import React from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, MessageSquare, User, Zap, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = React.useState([]);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data } = await axios.get('/users/suggested');
        setSuggestedUsers(data);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      }
    };
    if (user) fetchSuggestions();
  }, [user]);

  const handleFollow = async (id) => {
    try {
      await axios.post(`/users/follow/${id}`);
      // Refresh suggestions after follow
      const { data } = await axios.get('/users/suggested');
      setSuggestedUsers(data);
    } catch (err) {
      console.error('Failed to follow user:', err);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-vibe-gradient">
      {/* Background blobs for aesthetic */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-panel border-x-0 border-t-0 px-6 flex items-center justify-between z-50">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon-gradient flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="text-white" size={18} fill="white" />
          </div>
          <span className="text-xl font-bold text-gradient">Vibe</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/settings" className="text-white/40 hover:text-white transition-colors">
            <Settings size={20} />
          </Link>
          <button onClick={logout} className="text-red-400 hover:text-red-300 transition-colors cursor-pointer">
            <LogOut size={20} />
          </button>
          <Link to={`/profile/${user?._id}`} className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center border border-white/20">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={16} className="text-white/60" />
            )}
          </Link>
        </div>
      </header>

      <Sidebar />
      
      <main className="flex-1 relative z-10 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`max-w-4xl mx-auto pt-24 pb-28 ${location.pathname.startsWith('/messages') ? 'px-0' : 'px-4'} lg:py-8 lg:px-6`}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-x-0 border-b-0 px-6 flex items-center justify-between z-50">
        {[
          { icon: Home, path: '/' },
          { icon: Compass, path: '/explore' },
          { icon: MessageSquare, path: '/messages' },
          { icon: User, path: `/profile/${user?._id}` },
        ].map((item, i) => (
          <Link key={i} to={item.path} className={`p-2 transition-colors ${location.pathname === item.path ? 'text-primary' : 'text-white/40'}`}>
            <item.icon size={24} className={location.pathname === item.path ? 'drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]' : ''} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MainLayout;
