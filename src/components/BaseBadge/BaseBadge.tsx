import { HTMLAttributes, ReactNode } from 'react';

/**
 * Badge variant types
 */
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'amber';

/**
 * Badge size options
 */
type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Badge component props
 */
interface BaseBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge content */
  children: ReactNode;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
}

/**
 * Badge component for displaying status indicators or counts
 */
const BaseBadge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: BaseBadgeProps) => {
  // Base classes for all badges
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  // Variant-specific classes
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  };
  
  // Combine all classes
  const badgeClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className
  ].join(' ');
  
  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default BaseBadge;
