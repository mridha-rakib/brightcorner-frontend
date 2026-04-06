import type { MessageAttachment, MessageResponse } from '@/lib/api/types'

export const CHAT_ATTACHMENT_MAX_BYTES = 2 * 1024 * 1024
export const CHAT_ATTACHMENT_ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export const CHAT_EMOJI_OPTIONS = ['👍', '🎉', '🔥', '👏', '✅', '💡', '🙂', '🚀']

export function isImageAttachment(attachment: MessageAttachment): boolean {
  return attachment.mimeType.startsWith('image/')
}

export function resolveMessagePreview(message: Pick<MessageResponse, 'attachments' | 'text'>): string {
  const text = message.text.trim()
  if (text.length > 0)
    return text

  if (message.attachments.length === 0)
    return ''

  return `Shared ${message.attachments.length > 1 ? 'attachments' : message.attachments[0].name}`
}

export async function readChatAttachment(file: File): Promise<MessageAttachment> {
  if (!CHAT_ATTACHMENT_ALLOWED_MIME_TYPES.includes(file.type as (typeof CHAT_ATTACHMENT_ALLOWED_MIME_TYPES)[number])) {
    throw new Error('Only JPG, PNG, WEBP, and PDF files are supported in chat.')
  }

  if (file.size > CHAT_ATTACHMENT_MAX_BYTES)
    throw new Error('Attachments must be 2 MB or smaller.')

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to read the selected file.'))
        return
      }

      resolve(reader.result)
    }

    reader.onerror = () => reject(new Error('Unable to read the selected file.'))
    reader.readAsDataURL(file)
  })

  return {
    id: crypto.randomUUID(),
    mimeType: file.type,
    name: file.name,
    size: file.size,
    url: dataUrl,
  }
}
