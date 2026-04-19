'use client'

import { useEffect } from 'react'

import {
  getLanguageDirection,
  translateText,
  type LanguageCode,
} from '@/lib/i18n'
import { useLanguageStore } from '@/store/language-store'

const TRANSLATABLE_ATTRIBUTES = ['alt', 'aria-label', 'placeholder', 'title'] as const
const SKIP_SELECTOR = [
  'code',
  'pre',
  'script',
  'style',
  'textarea',
  'input',
  '[contenteditable="true"]',
  '.ql-editor',
].join(',')

const textSources = new WeakMap<Text, string>()
const attributeSources = new WeakMap<Element, Partial<Record<(typeof TRANSLATABLE_ATTRIBUTES)[number], string>>>()

function shouldSkipNode(node: Node): boolean {
  const parent = node.parentElement
  return Boolean(parent?.closest(SKIP_SELECTOR))
}

function translateTextNode(node: Text, language: LanguageCode) {
  if (shouldSkipNode(node))
    return

  const existingSource = textSources.get(node)
  const source = existingSource ?? node.data

  if (!existingSource)
    textSources.set(node, source)

  const nextValue = language === 'en' ? source : translateText(source, language)

  if (node.data !== nextValue)
    node.data = nextValue
}

function translateElementAttributes(element: Element, language: LanguageCode) {
  if (element.closest(SKIP_SELECTOR))
    return

  let sourceMap = attributeSources.get(element)

  for (const attribute of TRANSLATABLE_ATTRIBUTES) {
    const value = element.getAttribute(attribute)
    if (!value)
      continue

    if (!sourceMap) {
      sourceMap = {}
      attributeSources.set(element, sourceMap)
    }

    const source = sourceMap[attribute] ?? value
    sourceMap[attribute] = source

    const nextValue = language === 'en' ? source : translateText(source, language)
    if (value !== nextValue)
      element.setAttribute(attribute, nextValue)
  }
}

function translateTree(root: Node, language: LanguageCode) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text, language)
    return
  }

  if (root.nodeType !== Node.ELEMENT_NODE)
    return

  const rootElement = root as Element
  translateElementAttributes(rootElement, language)

  const walker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        return shouldSkipNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
      },
    },
  )

  let currentNode = walker.nextNode()
  while (currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE)
      translateTextNode(currentNode as Text, language)
    else if (currentNode.nodeType === Node.ELEMENT_NODE)
      translateElementAttributes(currentNode as Element, language)

    currentNode = walker.nextNode()
  }
}

export function LanguageRuntime() {
  const language = useLanguageStore(state => state.language)

  useEffect(() => {
    const direction = getLanguageDirection(language)
    document.documentElement.lang = language
    document.documentElement.dir = direction
    document.documentElement.dataset.language = language
  }, [language])

  useEffect(() => {
    translateTree(document.body, language)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') {
          translateTextNode(mutation.target as Text, language)
          continue
        }

        if (mutation.type === 'attributes') {
          translateElementAttributes(mutation.target as Element, language)
          continue
        }

        mutation.addedNodes.forEach(node => translateTree(node, language))
      }
    })

    observer.observe(document.body, {
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [language])

  return null
}

