import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const chipVariants = cva(
  'inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium uppercase w-fit whitespace-nowrap shrink-0 gap-1 transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        destructive: 'bg-destructive text-white hover:bg-destructive/90',
        outline:
          'border-border text-foreground hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        warning: 'bg-chart-3 text-white hover:bg-chart-3/90',
        success: 'bg-chart-2 text-white hover:bg-chart-2/90',
        info: 'bg-chart-1 text-white hover:bg-chart-1/90',
      },
      removable: {
        true: 'pr-1',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      removable: false,
    },
  }
)

export interface ChipProps
  extends React.ComponentProps<'div'>, VariantProps<typeof chipVariants> {
  onRemove?: () => void
}

function Chip({
  className,
  variant,
  removable = false,
  children,
  onRemove,
  ...props
}: ChipProps) {
  return (
    <div
      data-slot="chip"
      data-variant={variant}
      data-removable={removable}
      className={cn(chipVariants({ variant, removable }), className)}
      {...props}
    >
      <span className="py-0.5">{children}</span>
      {removable && (
        <button
          type="button"
          data-slot="chip-remove"
          className="hover:bg-white/10 rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          onClick={onRemove}
          aria-label={`Remove ${typeof children === 'string' ? children : 'chip'}`}
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}

export { Chip, chipVariants }
