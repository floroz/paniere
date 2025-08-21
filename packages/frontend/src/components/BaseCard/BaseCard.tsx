import { HTMLAttributes, ReactNode } from "react";

/**
 * Card variant types
 */
type CardVariant = "default" | "primary" | "secondary" | "amber" | "red";

/**
 * Card component props
 */
interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: ReactNode;
  /** Visual variant */
  variant?: CardVariant;
  /** Optional card title */
  title?: string;
  /** Whether to add padding */
  padding?: boolean;
}

/**
 * Card component for containing content with consistent styling
 */
const BaseCard = ({
  children,
  variant = "default",
  title,
  padding = true,
  className = "",
  ...props
}: BaseCardProps) => {
  // Base classes for all cards
  const baseClasses = "rounded-xl shadow-sm border overflow-hidden";

  // Variant-specific classes
  const variantClasses = {
    default: "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700",
    primary:
      "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30",
    secondary:
      "bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/30",
    amber:
      "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200/50 dark:from-amber-900/50 dark:to-amber-800/20 dark:border-amber-800/30",
    red: "bg-gradient-to-br from-red-50 to-red-100/50 border-red-200/50 dark:from-red-900/50 dark:to-red-800/20 dark:border-red-800/30",
  };

  // Padding classes
  const paddingClasses = padding ? "p-3" : "";

  // Combine all classes
  const cardClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses,
    className,
  ].join(" ");

  return (
    <div className={cardClasses} {...props}>
      {title && (
        <div className="mb-2 font-medium text-gray-700 dark:text-gray-300">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

export default BaseCard;
