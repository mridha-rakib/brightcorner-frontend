'use client'

import { getLanguageDirection, translateText } from '@/lib/i18n'
import { useLanguageStore } from '@/store/language-store'

export function useI18n() {
  const language = useLanguageStore(state => state.language)
  const direction = getLanguageDirection(language)

  return {
    language,
    direction,
    isRtl: direction === 'rtl',
    t: (value: string) => translateText(value, language),
  }
}
