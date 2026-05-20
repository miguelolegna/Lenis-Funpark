import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-6 py-3 font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        variant === 'primary' && "bg-brand-orange text-brand-light hover:scale-105 transition-transform duration-300 ease-bounce-short hover:bg-orange-600 focus:ring-brand-orange",
        variant === 'secondary' && "bg-brand-gray text-brand-dark hover:bg-gray-200 focus:ring-brand-gray hover:scale-105 transition-transform duration-300 ease-bounce-short",
        variant === 'danger' && "bg-brand-red text-brand-light hover:bg-red-600 focus:ring-brand-red hover:scale-105 transition-transform duration-300 ease-bounce-short",
        className
      )}
      {...props}
    />
  );
}
