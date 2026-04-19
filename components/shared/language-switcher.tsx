'use client'

import { Languages } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { SUPPORTED_LANGUAGES, translateText, type LanguageCode } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useLanguageStore } from '@/store/language-store'

export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname()
  const language = useLanguageStore(state => state.language)
  const setLanguage = useLanguageStore(state => state.setLanguage)
  const isMainChatPage = pathname === '/chat'

  return (
    <label
      className={cn(
        'language-switcher fixed right-4 z-[90] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-neutral-200 bg-white/95 px-3 py-2 text-neutral-700 shadow-xl shadow-neutral-900/10 backdrop-blur-md',
        isMainChatPage
          ? 'top-20 bottom-auto'
          : 'bottom-[calc(env(safe-area-inset-bottom)+1rem)] sm:bottom-4',
        className,
      )}
    >
      <Languages size={16} className="text-indigo-600" />
      <span className="sr-only">{translateText('Select language', language)}</span>
      <select
        value={language}
        aria-label={translateText('Select language', language)}
        onChange={event => setLanguage(event.target.value as LanguageCode)}
        className="max-w-[7rem] cursor-pointer bg-transparent text-xs font-bold outline-none"
      >
        {SUPPORTED_LANGUAGES.map(option => (
          <option key={option.code} value={option.code}>
            {option.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  )
}
