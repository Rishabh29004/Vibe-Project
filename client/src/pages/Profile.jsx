import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import PostCard from '../components/Feed/PostCard';
import { useAuth } from '../context/AuthContext';
import { Calendar, MessageSquare } from 'lucide-react';

import Modal from '../components/ui/Modal';
import { Link } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // 'followers', 'following', or null

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`/users/${id}`);
      setProfileData(data.user);
      setPosts(data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  if (isLoading) return (
    <MainLayout>
      <div className="animate-pulse space-y-6">
        <div className="h-64 glass-panel rounded-3xl" />
        <div className="h-40 glass-panel rounded-2xl" />
      </div>
    </MainLayout>
  );

  const isOwnProfile = currentUser?._id === id;
  const isFollowing = profileData?.followers?.some(f => f._id === currentUser?._id);

  const handleFollow = async () => {
    try {
      await axios.post(`/users/follow/${id}`);
      fetchProfile(); // Refresh data
    } catch (err) {
      console.error('Failed to follow:', err);
    }
  };

  const handleMessage = () => {
    // Navigate to messages and pass the user to start a chat
    navigate('/messages', { state: { startChatWith: profileData } });
  };

  const UserList = ({ users }) => (
    <div className="divide-y divide-white/5">
      {users.length > 0 ? (
        users.map(u => (
          <div key={u._id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
            <Link 
              to={`/profile/${u._id}`}
              onClick={() => setModalType(null)}
              className="flex items-center gap-4 flex-1"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center font-bold text-primary overflow-hidden border border-white/10">
                {u.profilePicture ? (
                  <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />
                ) : (
                  u.username[0].toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold group-hover:text-primary transition-colors">{u.username}</h4>
                <p className="text-xs text-white/40 truncate max-w-[200px]">{u.bio || 'Vibe creator'}</p>
              </div>
            </Link>
            {u._id !== currentUser?._id && (
              <button 
                onClick={() => {
                  setModalType(null);
                  navigate('/messages', { state: { startChatWith: u } });
                }}
                className="p-2 hover:bg-primary/20 rounded-full text-primary transition-all"
              >
                <MessageSquare size={18} />
              </button>
            )}
          </div>
        ))
      ) : (
        <div className="py-10 text-center text-white/20">No users found.</div>
      )}
    </div>
  );

  return (
    <MainLayout>
      {/* Banner & Profile Info */}
      <div className="relative mb-8">
        <div className="h-48 md:h-64 rounded-3xl overflow-hidden glass-panel border-white/5">
          {profileData?.bannerImage ? (
            <img src={profileData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-neon-gradient opacity-20" />
          )}
        </div>
        
        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
          <div className="w-32 h-32 rounded-3xl bg-neon-gradient p-[3px] shadow-xl">
            <div className="w-full h-full rounded-[21px] bg-background overflow-hidden flex items-center justify-center border-4 border-background">
              {profileData?.profilePicture ? (
                <img src={profileData.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl font-bold text-primary">{profileData?.username?.[0]?.toUpperCase()}</div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute -bottom-16 right-8 flex gap-3">
          {!isOwnProfile && (
            <>
              <Button 
                onClick={handleMessage}
                variant="secondary"
                className="p-3"
              >
                <MessageSquare size={20} />
              </Button>
              <Button 
                onClick={handleFollow}
                variant={isFollowing ? "secondary" : "primary"}
                className="px-8"
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* User Stats & Bio */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard className="md:col-span-2">
          <h2 className="text-3xl font-bold mb-1">{profileData?.username}</h2>
          <p className="text-white/40 text-sm mb-4">@{profileData?.username.toLowerCase()}</p>
          
          <p className="text-white/80 mb-6 leading-relaxed">
            {profileData?.bio || "No bio yet. This user is keeping it a mystery."}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-white/40">
            <div className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(profileData?.createdAt).toLocaleDateString()}</div>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-center items-center gap-4">
          <div className="grid grid-cols-2 gap-8 text-center w-full">
            <button 
              onClick={() => setModalType('following')}
              className="group"
            >
              <div className="text-2xl font-bold text-primary group-hover:scale-110 transition-transform">{profileData?.following?.length || 0}</div>
              <div className="text-xs text-white/30 uppercase tracking-widest group-hover:text-primary">Following</div>
            </button>
            <button 
              onClick={() => setModalType('followers')}
              className="group"
            >
              <div className="text-2xl font-bold text-secondary group-hover:scale-110 transition-transform">{profileData?.followers?.length || 0}</div>
              <div className="text-xs text-white/30 uppercase tracking-widest group-hover:text-secondary">Followers</div>
            </button>
          </div>
          <button 
            onClick={() => {
              const element = document.getElementById('vibes-section');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="pt-4 border-t border-white/5 w-full text-center group"
          >
            <div className="text-2xl font-bold text-accent group-hover:scale-110 transition-transform">{posts.length}</div>
            <div className="text-xs text-white/30 uppercase tracking-widest group-hover:text-accent">Total Vibes</div>
          </button>
        </GlassCard>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)}
        title={modalType === 'followers' ? 'Followers' : 'Following'}
      >
        <UserList users={modalType === 'followers' ? profileData?.followers : profileData?.following} />
      </Modal>

      {/* User Posts */}
      <div id="vibes-section" className="space-y-6">
        <h3 className="text-xl font-bold mb-4 px-2">Vibes</h3>
        {posts.length > 0 ? (
          posts.map(post => <PostCard key={post._id} post={post} onDelete={handlePostDeleted} />)
        ) : (
          <div className="text-center py-20 glass-panel rounded-2xl">
            <p className="text-white/20">This user hasn't shared any vibes yet.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
