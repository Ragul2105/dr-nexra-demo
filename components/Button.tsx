import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  // Base: 16px radius (rounded-2xl in Tailwind approx), Semibold font
  const baseStyles = "py-4 px-6 rounded-2xl font-semibold text-[15px] transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed tracking-wide";
  
  const variants = {
    // Gradient top-left (#22D3EE) to bottom-right (#3B82F6)
    // Shadow: Cyan glow
    primary: "bg-gradient-to-br from-[#22D3EE] to-[#3B82F6] hover:from-[#38BDF8] hover:to-[#60A5FA] text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] border border-white/10",
    
    // Glassmorphism Outline
    outline: "border border-white/10 bg-[#1E293B]/40 hover:bg-[#1E293B]/60 text-white backdrop-blur-md",
    
    ghost: "text-nexthria-text-secondary hover:text-white bg-transparent",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};