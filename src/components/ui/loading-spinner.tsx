import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react'

export const LoadingSpinner = ({
  className,
  color,
  size,
}: {
  className?: string
  color?: string
  size?: number
}) => {
  return (
    <LoaderCircle
      className={cn('animate-spin', className)}
      size={size}
      color={color}
    />
  )
}
