import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import { Search, Users } from 'lucide-react';

const Explore = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        handleSearch();
      } else {
        fetchTrending();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchSuggestions = async () => {
    try {
      const { data } = await axios.get('/users/suggested');
      setSuggestedUsers(data);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  const handleFollow = async (id) => {
    try {
      await axios.post(`/users/follow/${id}`);
      fetchSuggestions();
    } catch (err) {
      console.error('Failed to follow user:', err);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const { data } = await axios.get(`/search?query=${query}`);
      setResults(data);
    } catch (err) {
      console.error(err);
      // Mock search results
      setResults({
        users: [
          { _id: 'u1', username: 'Stellar_Voyager', bio: 'Exploring the digital frontier.' },
          { _id: 'u2', username: 'Neon_Pulse', bio: 'Music & Vibes.' }
        ],
        posts: []
      });
    } finally {
      setIsSearching(false);
    }
  };

  const fetchTrending = async () => {
    setIsSearching(true);
    try {
      const { data } = await axios.get('/posts'); 
      setResults({ users: [], posts: data.slice(0, 5) });
      await fetchSuggestions();
    } catch (err) {
      console.error(err);
      await fetchSuggestions();
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Explore</h2>
        <p className="text-white/40">Discover the next generation of vibes.</p>
      </div>

      <div className="relative mb-10">
        <Input 
          placeholder="Search for creators, vibes, or hashtags..." 
          className="pl-12 py-4"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
      </div>

      {isSearching ? (
        <div className="animate-pulse space-y-6">
          <div className="h-40 glass-panel rounded-2xl" />
          <div className="h-40 glass-panel rounded-2xl" />
        </div>
      ) : (
        <div className="space-y-10">
          {query ? (
            // Search Results Mode
            results.users.length > 0 ? (
              <section>
                <div className="flex items-center gap-2 mb-4 text-white/60">
                  <Users size={18} />
                  <h3 className="font-bold uppercase tracking-widest text-xs">
                    Search Results
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.users.map(user => (
                    <GlassCard key={user._id} className="flex items-center gap-4 py-4">
                      <Link to={`/profile/${user._id}`} className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                            {user.username ? user.username[0].toUpperCase() : ''}
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link to={`/profile/${user._id}`} className="font-bold hover:text-primary transition-colors">
                          {user.username}
                        </Link>
                        <p className="text-xs text-white/40 truncate max-w-[150px]">{user.bio || 'Vibe creator'}</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </section>
            ) : (
              <div className="text-center py-20">
                <p className="text-white/20 text-lg">No results found for "{query}"</p>
              </div>
            )
          ) : (
            // Center suggested creators to follow (Default Mode)
            <section>
              <div className="flex items-center gap-2 mb-4 text-white/60">
                <Users size={18} />
                <h3 className="font-bold uppercase tracking-widest text-xs">
                  Creators to Follow
                </h3>
              </div>
              {suggestedUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestedUsers.map(creator => (
                    <GlassCard key={creator._id} className="flex items-center gap-4 py-4">
                      <Link to={`/profile/${creator._id}`} className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0 hover:ring-2 hover:ring-primary/50 transition-all">
                        {creator.profilePicture ? (
                          <img src={creator.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                            {creator.username ? creator.username[0].toUpperCase() : ''}
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link to={`/profile/${creator._id}`} className="font-bold hover:text-primary transition-colors">
                          {creator.username}
                        </Link>
                        <p className="text-xs text-white/40 truncate max-w-[150px]">{creator.bio || 'Vibe creator'}</p>
                      </div>
                      <button 
                        onClick={() => handleFollow(creator._id)}
                        className={`ml-auto text-xs font-bold hover:scale-110 transition-transform px-4 py-2 rounded-full ${
                          creator.isFollowing 
                          ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-500' 
                          : 'bg-primary/10 text-primary hover:bg-primary hover:text-black'
                        }`}
                      >
                        {creator.isFollowing ? 'Unfollow' : 'Follow'}
                      </button>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-white/20 text-lg">No creators suggested yet.</p>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default Explore;
