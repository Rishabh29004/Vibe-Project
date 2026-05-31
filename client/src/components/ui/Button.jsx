import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, className, variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: 'bg-neon-gradient text-white shadow-lg hover:shadow-primary/40',
    secondary: 'glass-panel text-white hover:bg-white/10',
    outline: 'border border-primary text-primary hover:bg-primary/10',
    ghost: 'text-white/70 hover:text-white hover:bg-white/5',
    accent: 'bg-accent text-white hover:bg-accent-dark'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-8 py-3.5 text-lg',
    icon: 'p-2.5'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={twMerge(
        'rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
