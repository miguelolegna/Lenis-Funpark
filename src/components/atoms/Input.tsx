import React from 'react';
import { cn } from './Button';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-sm font-medium text-brand-dark/80">{label}</label>}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-md border border-brand-gray bg-brand-light px-4 py-2 text-brand-dark ring-offset-brand-light file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-dark/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-brand-red focus-visible:ring-brand-red",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-sm text-brand-red">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
