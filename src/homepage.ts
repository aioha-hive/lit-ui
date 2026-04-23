import { UserCtx } from '@aioha/providers/lit'
import { KeyTypes } from '@aioha/aioha'
import type { LoginResult } from '@aioha/aioha/build/types.js'
import { consume } from '@lit/context'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { styles } from '../lib/styles.js'
import { defaultMessages } from '../lib/i18n.js'
import '../lib'

const LOCALES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'hr', label: 'Hrvatski' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'pl', label: 'Polski' },
  { code: 'pt', label: 'Português' },
  { code: 'ru', label: 'Русский' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'en-XA', label: '🧪 Pseudo (en-XA)' }
]

const CATALOG_LOADERS: Record<string, () => Promise<{ default: Record<string, string> }>> = {
  ar: () => import('@aioha/i18n-keys/locales/ar.json'),
  de: () => import('@aioha/i18n-keys/locales/de.json'),
  es: () => import('@aioha/i18n-keys/locales/es.json'),
  fr: () => import('@aioha/i18n-keys/locales/fr.json'),
  hi: () => import('@aioha/i18n-keys/locales/hi.json'),
  hr: () => import('@aioha/i18n-keys/locales/hr.json'),
  it: () => import('@aioha/i18n-keys/locales/it.json'),
  ja: () => import('@aioha/i18n-keys/locales/ja.json'),
  ko: () => import('@aioha/i18n-keys/locales/ko.json'),
  ms: () => import('@aioha/i18n-keys/locales/ms.json'),
  pl: () => import('@aioha/i18n-keys/locales/pl.json'),
  pt: () => import('@aioha/i18n-keys/locales/pt.json'),
  ru: () => import('@aioha/i18n-keys/locales/ru.json'),
  'zh-CN': () => import('@aioha/i18n-keys/locales/zh-CN.json'),
  'zh-TW': () => import('@aioha/i18n-keys/locales/zh-TW.json')
}

const loaded = new Set<string>(['en', 'en-XA'])

async function loadLocaleCatalog(code: string) {
  if (loaded.has(code)) return
  const loader = CATALOG_LOADERS[code]
  if (!loader) return
  const cat = (await loader()).default
  defaultMessages.addCatalog(code, cat)
  loaded.add(code)
}

@customElement('home-page')
export class Homepage extends LitElement {
  @consume({ context: UserCtx, subscribe: true })
  @state()
  private _user?: string

  @state()
  private _aiohaModalDisplayed = false

  @state()
  private _language = 'en'

  @state()
  private _direction: 'auto' | 'ltr' | 'rtl' = 'auto'

  private _handleLanguageChange = async (e: Event) => {
    const code = (e.target as HTMLSelectElement).value
    await loadLocaleCatalog(code)
    this._language = code
  }

  private _handleDirectionChange = (e: Event) => {
    this._direction = (e.target as HTMLSelectElement).value as 'auto' | 'ltr' | 'rtl'
  }

  render() {
    return html`
      <div class="dark">
        <div class="flex items-start gap-3 p-4 flex-wrap">
          <button
            type="button"
            class="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:outline-hidden focus:ring-gray-100 hover:cursor-pointer font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
            @click="${() => {
              this._aiohaModalDisplayed = true
            }}"
          >
            ${this._user ?? 'Connect Wallet'}
          </button>
          <label class="text-sm text-gray-700 dark:text-gray-200 inline-flex items-center gap-2">
            <span>Language</span>
            <select
              class="text-sm rounded-lg border border-gray-300 bg-white text-gray-900 px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-hidden"
              .value="${this._language}"
              @change="${this._handleLanguageChange}"
            >
              ${LOCALES.map(
                (l) => html`<option value="${l.code}" ?selected="${l.code === this._language}">${l.label} (${l.code})</option>`
              )}
            </select>
          </label>
          <label class="text-sm text-gray-700 dark:text-gray-200 inline-flex items-center gap-2">
            <span>Direction</span>
            <select
              class="text-sm rounded-lg border border-gray-300 bg-white text-gray-900 px-2 py-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-hidden"
              .value="${this._direction}"
              @change="${this._handleDirectionChange}"
            >
              <option value="auto" ?selected="${this._direction === 'auto'}">auto</option>
              <option value="ltr" ?selected="${this._direction === 'ltr'}">ltr</option>
              <option value="rtl" ?selected="${this._direction === 'rtl'}">rtl</option>
            </select>
          </label>
        </div>
        <aioha-modal
          ?displayed="${this._aiohaModalDisplayed}"
          language="${this._language}"
          direction="${this._direction}"
          .loginOptions="${{ msg: 'Hello World', keyType: KeyTypes.Posting }}"
          arrangement="grid"
          .onClose="${() => {
            this._aiohaModalDisplayed = false
          }}"
          .onLogin="${(result: LoginResult) => {
            console.log(result)
          }}"
        >
        </aioha-modal>
      </div>
    `
  }
  static styles = styles
}
