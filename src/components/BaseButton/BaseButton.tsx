import { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Button variant types
 */
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

/**
 * Button size options
 */
type ButtonSize = "sm" | "md" | "lg";

/**
 * Button component props
 */
interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content */
  children: ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon to display before text */
  leftIcon?: ReactNode;
  /** Icon to display after text */
  rightIcon?: ReactNode;
}

/**
 * Base button component with consistent styling
 */
const BaseButton = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: BaseButtonProps) => {
  // Base classes for all buttons
  const baseClasses =
    "relative flex items-center justify-center font-medium rounded-lg transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Size-specific classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // Variant-specific classes
  const variantClasses = {
    primary:
      "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700",
    secondary:
      "bg-gray-100 hover:bg-red-100 text-gray-700 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-red-900/40 dark:text-gray-200",
    danger:
      "bg-red-100 hover:bg-red-200 text-red-700 focus:ring-red-500 dark:bg-red-900/30 dark:hover:bg-red-800/40 dark:text-red-300",
    ghost:
      "bg-transparent hover:bg-red-100 text-gray-700 focus:ring-gray-500 dark:hover:bg-red-900/40 dark:text-gray-200",
  };

  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";

  // Disabled state
  const disabledClasses = props.disabled ? "opacity-50 cursor-not-allowed" : "";

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClasses,
    disabledClasses,
    className,
  ].join(" ");

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" && !props.disabled && props.onClick) {
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
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <span className="relative z-10 flex items-center">
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </span>
      <span className="absolute inset-0 w-full h-full bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
    </button>
  );
};

export default BaseButton;
