import { cn } from '@/shared/lib/utils'

export const APP_HEADER_BASE_CLASS_NAME =
  'sticky top-0 z-50 flex items-center justify-between border-b border-border/70 bg-card/90 px-6 py-4 backdrop-blur-md transition-shadow duration-200 md:px-12'

export const APP_HEADER_ELEVATED_CLASS_NAME = 'shadow-[0_10px_24px_-20px_hsl(var(--foreground)/0.18)]'

export function getAppHeaderClassName(isElevated: boolean): string {
  return cn(APP_HEADER_BASE_CLASS_NAME, isElevated && APP_HEADER_ELEVATED_CLASS_NAME)
}
