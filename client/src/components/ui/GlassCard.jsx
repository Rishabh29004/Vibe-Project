import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

const GlassCard = ({ children, className, hover = true, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        'glass-panel rounded-2xl overflow-hidden relative',
        hover && 'hover:bg-white/[0.04] hover:border-white/20 transition-all duration-500',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
