import { format, isToday, isYesterday } from 'date-fns'

export function formatChatTimestamp(value?: string | null): string {
  if (!value)
    return ''

  const date = new Date(value)

  if (isToday(date))
    return format(date, 'hh:mm a')

  if (isYesterday(date))
    return 'Yesterday'

  return format(date, 'MMM d')
}

export function formatMessageTimestamp(value: string): string {
  return format(new Date(value), 'hh:mm a')
}

export function formatMessageDayLabel(value: string): string {
  const date = new Date(value)

  if (isToday(date))
    return 'Today'

  if (isYesterday(date))
    return 'Yesterday'

  return format(date, 'MMMM d, yyyy')
}
