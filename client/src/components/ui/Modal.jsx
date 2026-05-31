import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import GlassCard from './GlassCard';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg z-10"
        >
          <GlassCard className="p-0 overflow-hidden border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <h3 className="text-xl font-bold text-gradient">{title}</h3>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {children}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
