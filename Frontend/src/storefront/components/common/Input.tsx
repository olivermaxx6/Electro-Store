import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  // helperText is already extracted from props, so we don't need to exclude it again
  // The remaining props are safe to pass to the input element
  const baseClasses = `
    w-full
    px-4
    py-3
    text-base
    font-normal
    transition-all
    duration-200
    focus:outline-none
    focus:ring-2
    focus:ring-primary
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const variantClasses = {
    default: `
      bg-surface-elevated
      border
      border-border
      text-ink
      placeholder:text-muted
      hover:border-border-dark
      focus:border-primary
      rounded-lg
    `,
    filled: `
      bg-surface
      border
      border-transparent
      text-ink
      placeholder:text-muted
      hover:bg-surface-elevated
      focus:bg-surface-elevated
      focus:border-primary
      rounded-lg
    `,
    outlined: `
      bg-transparent
      border-2
      border-border
      text-ink
      placeholder:text-muted
      hover:border-border-dark
      focus:border-primary
      rounded-lg
    `,
  };

  const errorClasses = error ? `
    border-error
    focus:ring-error
    focus:border-error
  ` : '';

  const inputClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${errorClasses}
    ${leftIcon ? 'pl-12' : ''}
    ${rightIcon ? 'pr-12' : ''}
    ${className}
  `.trim();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;