import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/Layout/MainLayout';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';

const Settings = () => {
  const { user, setUser } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    bio: user?.bio || ''
  });
  const [emailData, setEmailData] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Sync state with context when user shifts/changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        bio: user.bio || ''
      });
      setEmailData(user.email || '');
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess('');
    setError('');
    try {
      const { data } = await axios.put('/users/update', {
        username: profileData.username,
        bio: profileData.bio
      });
      // Update local storage and context
      const stored = JSON.parse(localStorage.getItem('vibe_user'));
      const updated = { ...stored, ...data };
      localStorage.setItem('vibe_user', JSON.stringify(updated));
      setUser(updated);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess('');
    setError('');
    try {
      const { data } = await axios.put('/users/update', {
        email: emailData
      });
      const stored = JSON.parse(localStorage.getItem('vibe_user'));
      const updated = { ...stored, ...data };
      localStorage.setItem('vibe_user', JSON.stringify(updated));
      setUser(updated);
      setSuccess('Gmail updated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update Gmail');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmail = async () => {
    if (!window.confirm('Are you sure you want to remove your Gmail? This will leave your account without a Gmail address linked.')) {
      return;
    }
    setIsLoading(true);
    setSuccess('');
    setError('');
    try {
      const { data } = await axios.put('/users/update', {
        email: ''
      });
      const stored = JSON.parse(localStorage.getItem('vibe_user'));
      const updated = { ...stored, email: '' };
      localStorage.setItem('vibe_user', JSON.stringify(updated));
      setUser(updated);
      setEmailData('');
      setSuccess('Gmail removed successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete Gmail');
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-white/40">Customize your Vibe experience.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          {sections.map(section => (
            <div
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setSuccess('');
                setError('');
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                section.id === activeSection 
                  ? 'bg-primary/10 text-primary border border-primary/20' 
                  : 'text-white/40 hover:bg-white/5 border border-transparent'
              }`}
            >
              <section.icon size={20} />
              <span className="font-medium">{section.label}</span>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          <GlassCard className="max-w-2xl">
            {success && (
              <div className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {activeSection === 'profile' ? (
              <>
                <h3 className="text-xl font-bold mb-6">Edit Profile</h3>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <Input 
                    label="Username" 
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    required
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 ml-1">Bio</label>
                    <textarea
                      name="bio"
                      rows="4"
                      className="w-full glass-panel rounded-xl px-4 py-3 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-6">Account Settings</h3>
                
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <Input 
                    label="Gmail / Email Address" 
                    name="email"
                    type="email"
                    placeholder="Enter your Gmail address"
                    value={emailData}
                    onChange={(e) => setEmailData(e.target.value)}
                  />

                  <div className="pt-4 space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading || !emailData.trim()}>
                      {isLoading ? 'Saving...' : 'Update Gmail'}
                    </Button>

                    {user?.email && (
                      <Button 
                        type="button" 
                        onClick={handleDeleteEmail} 
                        className="w-full border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/50" 
                        disabled={isLoading}
                      >
                        Delete Gmail
                      </Button>
                    )}
                  </div>
                </form>
              </>
            )}
          </GlassCard>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
