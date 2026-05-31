import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Subtle background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-secondary/8 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neon-gradient flex items-center justify-center">
            <Zap size={18} fill="white" className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter">VIBE</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-white/60 hover:text-white transition-colors text-sm">
            Login
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero — centred, nothing else */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          <h1 className="text-6xl md:text-7xl font-black tracking-tight">
            Join the <span className="text-gradient">Vibe</span>
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/register">
              <Button size="lg" className="px-10 h-14 text-base group">
                Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="px-10 h-14 text-base">
                Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
