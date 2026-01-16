import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className={`relative group ${className}`}>
      {icon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-nexthria-text-tertiary group-focus-within:text-nexthria-cyan transition-colors duration-300">
          {icon}
        </div>
      )}
      <input
        // Bg: #1F2937, Text: White, Placeholder: Slate-500
        className={`w-full bg-[#1F2937] border border-transparent rounded-2xl py-4 ${icon ? 'pl-12' : 'pl-5'} pr-5 text-white placeholder-slate-500 text-[15px] font-medium focus:outline-none focus:bg-[#263345] focus:border-nexthria-cyan/30 focus:ring-2 focus:ring-nexthria-cyan/10 transition-all duration-300`}
        {...props}
      />
    </div>
  );
};