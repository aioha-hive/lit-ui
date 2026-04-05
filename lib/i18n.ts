import i18next from 'i18next'
import { createContext } from '@lit/context'
import type { i18n as I18nInstance } from 'i18next'
import en from './locales/en.js'

export const I18nCtx = createContext<I18nInstance>(Symbol.for('AiohaI18n'))

export const i18n: I18nInstance = i18next.createInstance()

i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['aioha'],
  defaultNS: 'aioha',
  resources: {
    en: { aioha: en }
  },
  interpolation: {
    escapeValue: false
  }
})

export const addTranslations = (lng: string, resources: Partial<typeof en>) => {
  i18n.addResourceBundle(lng, 'aioha', resources, true, true)
}
