import type { MessageAttachment, MessageResponse } from '@/lib/api/types'

export const CHAT_ATTACHMENT_MAX_BYTES = 2 * 1024 * 1024
export const CHAT_ATTACHMENT_ALLOWED_MIME_TYPES = [
  'application/msword',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/csv',
] as const

export const CHAT_ATTACHMENT_ACCEPT = [
  '.csv',
  '.doc',
  '.docx',
  '.jpeg',
  '.jpg',
  '.pdf',
  '.png',
  '.webp',
  '.xls',
  '.xlsx',
].join(',')

export const CHAT_EMOJI_OPTIONS = ['👍', '🎉', '🔥', '👏', '✅', '💡', '🙂', '🚀']

const ATTACHMENT_EXTENSION_TO_MIME_TYPE: Record<string, string> = {
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
  png: 'image/png',
  webp: 'image/webp',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

function sanitizeAttachmentValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function inferMimeTypeFromDataUrl(url: string): string | null {
  if (!url.startsWith('data:'))
    return null

  const payload = url.split(',', 2)[1]
  if (!payload || typeof atob !== 'function')
    return null

  try {
    const encodedPrefix = payload.slice(0, 64)
    const paddedPrefix = encodedPrefix + '='.repeat((4 - (encodedPrefix.length % 4)) % 4)
    const decodedPrefix = atob(paddedPrefix)
    const prefixBytes = Uint8Array.from(decodedPrefix, char => char.charCodeAt(0))
    return inferMimeTypeFromSignature(prefixBytes)
  }
  catch {
    return null
  }
}

function inferMimeType(attachment: Partial<MessageAttachment>): string {
  const url = sanitizeAttachmentValue(attachment.url)
  if (url.startsWith('data:')) {
    const payloadMimeType = inferMimeTypeFromDataUrl(url)
    if (payloadMimeType)
      return payloadMimeType
  }

  const explicitMimeType = sanitizeAttachmentValue(attachment.mimeType)
  if (explicitMimeType)
    return explicitMimeType

  if (url.startsWith('data:')) {
    const mimeType = url.slice(5).split(';', 1)[0]?.trim()
    if (mimeType)
      return mimeType
  }

  const nameOrUrl = sanitizeAttachmentValue(attachment.name) || url
  const extension = nameOrUrl
    .split(/[?#]/, 1)[0]
    .split('.')
    .pop()
    ?.toLowerCase()

  if (extension && extension in ATTACHMENT_EXTENSION_TO_MIME_TYPE)
    return ATTACHMENT_EXTENSION_TO_MIME_TYPE[extension]

  return 'application/octet-stream'
}

function inferAttachmentName(attachment: Partial<MessageAttachment>, fallbackKey: string): string {
  const explicitName = sanitizeAttachmentValue(attachment.name)
  if (explicitName)
    return explicitName

  const url = sanitizeAttachmentValue(attachment.url)
  if (!url)
    return `attachment-${fallbackKey}`

  if (url.startsWith('data:')) {
    const mimeType = inferMimeType(attachment)
    const extension = mimeType.split('/')[1] || 'bin'
    return `attachment-${fallbackKey}.${extension}`
  }

  const lastSegment = url
    .split(/[?#]/, 1)[0]
    .split('/')
    .filter(Boolean)
    .pop()

  return lastSegment ? decodeURIComponent(lastSegment) : `attachment-${fallbackKey}`
}

function normalizeAttachmentUrl(url: string, mimeType: string): string {
  if (!url.startsWith('data:'))
    return url

  const headerMimeType = url.slice(5).split(';', 1)[0]?.trim()
  if (!headerMimeType || headerMimeType === mimeType)
    return url

  return url.replace(/^data:[^;]+;/, `data:${mimeType};`)
}

function getAttachmentExtension(fileName: string): string {
  return fileName
    .split(/[?#]/, 1)[0]
    .split('.')
    .pop()
    ?.toLowerCase()
    ?? ''
}

function matchesBytes(fileBytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (fileBytes.length < offset + signature.length)
    return false

  return signature.every((byte, index) => fileBytes[offset + index] === byte)
}

function inferMimeTypeFromSignature(fileBytes: Uint8Array): string | null {
  if (matchesBytes(fileBytes, [0xFF, 0xD8, 0xFF]))
    return 'image/jpeg'

  if (matchesBytes(fileBytes, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))
    return 'image/png'

  if (
    matchesBytes(fileBytes, [0x52, 0x49, 0x46, 0x46])
    && matchesBytes(fileBytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp'
  }

  if (matchesBytes(fileBytes, [0x25, 0x50, 0x44, 0x46]))
    return 'application/pdf'

  return null
}

function normalizeSelectedFileMimeType(file: File, fileBytes: Uint8Array): string {
  const inferredMimeType = inferMimeTypeFromSignature(fileBytes)
  if (inferredMimeType)
    return inferredMimeType

  const normalizedFileType = sanitizeAttachmentValue(file.type).toLowerCase()
  if (
    normalizedFileType
    && CHAT_ATTACHMENT_ALLOWED_MIME_TYPES.includes(normalizedFileType as (typeof CHAT_ATTACHMENT_ALLOWED_MIME_TYPES)[number])
  ) {
    return normalizedFileType
  }

  const extensionMimeType = ATTACHMENT_EXTENSION_TO_MIME_TYPE[getAttachmentExtension(file.name)]
  if (
    extensionMimeType
    && CHAT_ATTACHMENT_ALLOWED_MIME_TYPES.includes(extensionMimeType as (typeof CHAT_ATTACHMENT_ALLOWED_MIME_TYPES)[number])
  ) {
    return extensionMimeType
  }

  throw new Error('Only JPG, PNG, WEBP, PDF, DOC, DOCX, XLS, XLSX, and CSV files are supported in chat.')
}

async function toDataUrl(fileBytes: Uint8Array, mimeType: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Unable to read the selected file.'))
        return
      }

      resolve(reader.result)
    }

    reader.onerror = () => reject(new Error('Unable to read the selected file.'))
    reader.readAsDataURL(new Blob([fileBytes], { type: mimeType }))
  })
}

export function normalizeMessageAttachment(
  attachment: Partial<MessageAttachment> | null | undefined,
  fallbackKey: string,
): MessageAttachment | null {
  if (!attachment)
    return null

  const url = sanitizeAttachmentValue(attachment.url)
  if (!url)
    return null

  const name = inferAttachmentName(attachment, fallbackKey)
  const mimeType = inferMimeType(attachment)
  const normalizedUrl = normalizeAttachmentUrl(url, mimeType)
  const size = typeof attachment.size === 'number' && Number.isFinite(attachment.size)
    ? Math.max(0, attachment.size)
    : 0

  return {
    id: sanitizeAttachmentValue(attachment.id) || `${name}-${fallbackKey}`,
    mimeType,
    name,
    size,
    url: normalizedUrl,
  }
}

export function normalizeMessageAttachments(
  attachments: Array<Partial<MessageAttachment> | null | undefined> | null | undefined,
): MessageAttachment[] {
  return (attachments ?? []).reduce<MessageAttachment[]>((normalized, attachment, index) => {
    const nextAttachment = normalizeMessageAttachment(attachment, String(index + 1))
    if (nextAttachment)
      normalized.push(nextAttachment)

    return normalized
  }, [])
}

export function resolveAttachmentKey(attachment: MessageAttachment, fallbackKey: string): string {
  return `${sanitizeAttachmentValue(attachment.id) || 'attachment'}-${fallbackKey}`
}

export function isImageAttachment(attachment: MessageAttachment): boolean {
  return inferMimeType(attachment).startsWith('image/')
}

export function resolveMessagePreview(message: Pick<MessageResponse, 'attachments' | 'text'>): string {
  const text = message.text?.trim() ?? ''
  if (text.length > 0)
    return text

  const attachments = normalizeMessageAttachments(message.attachments)
  if (attachments.length === 0)
    return ''

  return `Shared ${attachments.length > 1 ? 'attachments' : attachments[0].name}`
}

export async function readChatAttachment(file: File): Promise<MessageAttachment> {
  if (file.size > CHAT_ATTACHMENT_MAX_BYTES)
    throw new Error('Attachments must be 2 MB or smaller.')

  const fileBytes = new Uint8Array(await file.arrayBuffer())
  const mimeType = normalizeSelectedFileMimeType(file, fileBytes)
  const dataUrl = await toDataUrl(fileBytes, mimeType)

  return {
    id: crypto.randomUUID(),
    mimeType,
    name: file.name,
    size: file.size,
    url: dataUrl,
  }
}
