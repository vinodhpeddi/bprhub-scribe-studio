
import React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, active = false, variant = 'default', size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    const variantClasses = {
      default: 'bg-white hover:bg-editor-soft-purple text-gray-700 hover:text-editor-primary',
      outline: 'border border-gray-300 bg-transparent hover:bg-editor-soft-purple text-gray-700 hover:text-editor-primary',
      ghost: 'bg-transparent hover:bg-editor-soft-purple text-gray-700 hover:text-editor-primary'
    };

    const baseClasses = 'rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-editor-primary focus:ring-opacity-50';
    
    const activeClasses = active 
      ? 'bg-editor-primary text-white hover:bg-editor-secondary hover:text-white' 
      : '';

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={ref}
              className={cn(
                baseClasses,
                sizeClasses[size],
                variantClasses[variant],
                activeClasses,
                className
              )}
              {...props}
            >
              {icon}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
