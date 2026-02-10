import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`w-full p-3 ${icon ? 'pl-10' : ''} bg-white border rounded-lg outline-none transition-all duration-200
            ${error 
              ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
              : 'border-gray-300 focus:border-brand-blue focus:ring-2 focus:ring-blue-100'
            } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500 mt-0.5">{error}</span>
      )}
    </div>
  );
};