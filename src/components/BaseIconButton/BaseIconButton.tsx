import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * IconButton variant types
 */
type IconButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/**
 * IconButton size options
 */
type IconButtonSize = 'sm' | 'md' | 'lg';

/**
 * IconButton component props
 */
interface BaseIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon to display */
  icon: ReactNode;
  /** Optional label text */
  label?: string;
  /** Visual variant */
  variant?: IconButtonVariant;
  /** Button size */
  size?: IconButtonSize;
  /** Accessibility label */
  'aria-label': string;
}

/**
 * Icon button component for actions with optional label
 */
const BaseIconButton = ({
  icon,
  label,
  variant = 'secondary',
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
  ...props
}: BaseIconButtonProps) => {
  // Base classes for all icon buttons
  const baseClasses = 'relative flex items-center justify-center font-medium rounded-lg transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };
  
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
    danger: 'bg-red-100 hover:bg-red-200 text-red-700 focus:ring-red-500 dark:bg-red-900/30 dark:hover:bg-red-800/40 dark:text-red-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500 dark:hover:bg-gray-800 dark:text-gray-200'
  };
  
  // Disabled state
  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Combine all classes
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    disabledClasses,
    className
  ].join(' ');

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' && !props.disabled && props.onClick) {
      // Simply trigger the click handler when Enter is pressed
      // This simulates a click without needing to create a synthetic event
      e.preventDefault();
      e.currentTarget.click();
    }
    
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };
  
  return (
    <button
      className={buttonClasses}
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <span className="relative z-10 flex items-center">
        {icon}
        {label && <span className="ml-1">{label}</span>}
      </span>
      <span className="absolute inset-0 w-full h-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    </button>
  );
};

export default BaseIconButton;
