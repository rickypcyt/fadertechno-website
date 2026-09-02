'use client'

import { createContext, useContext } from 'react'
import type { Dictionary } from './dictionaries'

const I18nContext = createContext<Dictionary | null>(null)

export function I18nProvider({
  dict,
  children,
}: {
  dict: Dictionary
  children: React.ReactNode
}) {
  return <I18nContext.Provider value={dict}>{children}</I18nContext.Provider>
}

export function useDict(): Dictionary {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useDict must be used within I18nProvider')
  }
  return ctx
}
