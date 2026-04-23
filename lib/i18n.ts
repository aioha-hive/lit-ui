import { createContext } from '@lit/context'
import { createDefaultMessages, type Catalog, type DefaultMessages, type Messages } from '@aioha/i18n-keys'

export { createDefaultMessages } from '@aioha/i18n-keys'
export type { Messages, DefaultMessages, MessageId, Catalog, MessageVars, Direction } from '@aioha/i18n-keys'

export const defaultMessages: DefaultMessages = createDefaultMessages({ initialLocale: 'en' })

export const MessagesCtx = createContext<Messages>(Symbol.for('AiohaMessages'))

export function loadLocale(locale: string, catalog: Partial<Catalog>): void {
  defaultMessages.addCatalog(locale, catalog)
}
