import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import GlassCard from '../../components/ui/GlassCard';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-vibe-gradient">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <GlassCard className="w-full max-w-md" hover={false}>
        <div className="text-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gradient mb-2"
          >
            Join Vibe
          </motion.h1>

        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <Input 
            label="Username" 
            name="username"
            placeholder="vibe_creator" 
            value={formData.username}
            onChange={handleChange}
            required
          />

          <Input 
            label="Email" 
            name="email"
            type="email" 
            placeholder="your@email.com" 
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input 
            label="Password" 
            name="password"
            type="password" 
            placeholder="••••••••" 
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input 
            label="Confirm Password" 
            name="confirmPassword"
            type="password" 
            placeholder="••••••••" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button 
            type="submit" 
            className="w-full mt-4" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-white/40">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default Register;
