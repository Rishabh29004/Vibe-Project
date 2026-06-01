import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Compass, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link to={path}>
    <motion.div
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? 'bg-primary/10 text-primary border border-primary/20' 
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={22} className={active ? 'drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]' : ''} />
      <span className="font-medium">{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
        />
      )}
    </motion.div>
  </Link>
);

const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: `/profile/${user?._id}` },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="hidden lg:flex w-64 h-screen sticky top-0 flex-col p-4 glass-panel border-y-0 border-l-0">
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center shadow-lg shadow-primary/20">
          <Zap className="text-white" size={24} fill="white" />
        </div>
        <h1 className="text-2xl font-bold text-gradient">Vibe</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.path} 
            {...item} 
            active={location.pathname === item.path}
          />
        ))}
      </nav>

      <div className="pt-4 mt-4 border-t border-white/10">
        <motion.button
          onClick={logout}
          whileHover={{ x: 5 }}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
        >
          <LogOut size={22} />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
