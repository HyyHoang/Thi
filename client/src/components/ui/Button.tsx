import React, { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'danger' | 'ghost' | 'secondary';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', isLoading, children, className = '', disabled, ...props }, ref) => {
        const baseClass = `${variant}-btn`;
        const loadingClass = isLoading ? 'loading' : '';
        const classes = `p-btn ${baseClass} ${loadingClass} ${className}`.trim();

        return (
            <button
                ref={ref}
                className={classes}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? <span className="spinner"></span> : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
