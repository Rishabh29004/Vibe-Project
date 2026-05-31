import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && <label className="text-sm font-medium text-white/60 ml-1">{label}</label>}
      <input
        className={twMerge(
          'w-full glass-panel rounded-xl px-4 py-3 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all duration-300',
          error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};

export default Input;
