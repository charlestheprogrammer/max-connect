import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTripDate(date: Date) {
  return format(date, 'dd LLL y', {
    locale: fr,
  })
}
