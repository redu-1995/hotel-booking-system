import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'gold' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  id,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none active:scale-[0.99]';
  
  // Border radius ~8px as requested
  const radiusClasses = 'rounded-[8px]';

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'h-9 px-3.5 text-sm gap-1.5',
    md: 'h-11 px-5 text-[15px] gap-2',
    lg: 'h-13 px-7 text-base gap-2.5',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-[#12355B] text-white hover:bg-[#0e2a4a] active:bg-[#0a1e34] focus:ring-[#12355B]/40 shadow-sm disabled:bg-[#12355B]/50 disabled:cursor-not-allowed',
    secondary: 'bg-white text-[#12355B] border border-[#12355B] hover:bg-[#12355B]/5 active:bg-[#12355B]/10 focus:ring-[#12355B]/30 disabled:border-[#12355B]/40 disabled:text-[#12355B]/40 disabled:cursor-not-allowed',
    gold: 'bg-[#D4A853] text-[#1F2937] font-semibold hover:bg-[#c69a47] active:bg-[#b58b38] focus:ring-[#D4A853]/50 shadow-sm disabled:bg-[#D4A853]/50 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-[#12355B] hover:bg-[#12355B]/5 focus:ring-[#12355B]/20',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      id={id}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${radiusClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
