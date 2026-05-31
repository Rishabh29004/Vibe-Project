import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import GlassCard from '../components/ui/GlassCard';
import { Heart, MessageSquare, UserPlus, Zap } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
      // Mock notifications
      setNotifications([
        {
          _id: 'n1',
          type: 'like',
          sender: { username: 'Nebula_Sky' },
          createdAt: new Date().toISOString(),
          read: false
        },
        {
          _id: 'n2',
          type: 'follow',
          sender: { username: 'Cyber_Punk' },
          createdAt: new Date().toISOString(),
          read: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async () => {
    try {
      await axios.put('/notifications/read');
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <Heart size={18} className="text-primary fill-primary" />;
      case 'comment': return <MessageSquare size={18} className="text-secondary fill-secondary" />;
      case 'follow': return <UserPlus size={18} className="text-accent" />;
      default: return <Zap size={18} className="text-white" />;
    }
  };

  const getMessage = (notif) => {
    switch (notif.type) {
      case 'like': return 'liked your vibe';
      case 'comment': return `commented: "${notif.post?.content?.substring(0, 20)}..."`;
      case 'follow': return 'started following you';
      default: return 'sent you a notification';
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Notifications</h2>
        <p className="text-white/40">Stay updated with your community.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-20 glass-panel rounded-2xl animate-pulse" />)
        ) : notifications.length > 0 ? (
          notifications.map(notif => (
            <GlassCard key={notif._id} className={`flex items-center gap-4 py-4 ${!notif.read ? 'border-primary/30 bg-primary/5' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-bold text-white mr-1">{notif.sender?.username}</span>
                  <span className="text-white/60">{getMessage(notif)}</span>
                </p>
                <p className="text-[10px] text-white/30 mt-1">
                  {new Date(notif.createdAt).toLocaleTimeString()}
                </p>
              </div>
              {!notif.read && <div className="w-2 h-2 bg-primary rounded-full" />}
            </GlassCard>
          ))
        ) : (
          <div className="text-center py-20 glass-panel rounded-2xl">
            <p className="text-white/20">All quiet here. No notifications yet.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;
