import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { AiohaCtx } from '@aioha/providers/lit'
import type { Aioha } from '@aioha/aioha'
import { Providers } from '@aioha/aioha'
import { MessagesController } from '../../messages-controller.js'
import { ProviderInfo } from '../ProviderInfo.js'
import { CloseIcon, EyeIcon } from '../Icons.js'

type ProviderCb = (provider: Providers) => any
export type Arrangement = 'list' | 'grid'

const ProvidersSeq: Providers[] = [
  Providers.Keychain,
  Providers.PeakVault,
  Providers.MetaMaskSnap,
  Providers.HiveAuth,
  Providers.HiveSigner,
  Providers.Ledger,
  Providers.ViewOnly
]

@customElement('provider-selection')
export class ProviderSelection extends LitElement {
  @property({ type: String })
  helpUrl?: string

  @property({ attribute: false })
  forceShow: Providers[] = []

  @property({ attribute: false })
  arrangement: Arrangement = 'list'

  @property({ attribute: false })
  onCancel?: () => any

  @property({ attribute: false })
  onSelected?: ProviderCb

  @consume({ context: AiohaCtx })
  private _aioha!: Aioha

  private _messages = new MessagesController(this)

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  private _getProviderName(provider: Providers): string {
    if (provider === Providers.ViewOnly) return this._messages.t('wallet.provider.viewOnly')
    if (provider === Providers.Custom) return this._messages.t('wallet.provider.other')
    return ProviderInfo[provider].name
  }

  private _getProviderBadge(provider: Providers): string | undefined {
    if (provider === Providers.Keychain) return this._messages.t('wallet.badge.popular')
    if (provider === Providers.MetaMaskSnap) return this._messages.t('wallet.badge.snap')
    return ProviderInfo[provider].loginBadge
  }

  private _renderBadge(label?: string) {
    if (!label) return html``
    return html`
      <span
        class="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-gray-500 bg-gray-200 rounded-sm dark:bg-gray-700 dark:text-gray-400"
      >
        ${label}
      </span>
    `
  }

  private _renderProviderBtnList(provider: Providers, forceShow: boolean) {
    if (!this._aioha.isProviderEnabled(provider) && !(forceShow && this._aioha.isProviderRegistered(provider))) {
      return html``
    }

    const { icon, iconDark } = ProviderInfo[provider]
    const name = this._getProviderName(provider)
    const badge = this._getProviderBadge(provider)
    return html`
      <li>
        <button
          type="button"
          class="flex items-center w-full p-3 text-base font-bold text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group hover:shadow-sm hover:cursor-pointer dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
          @click="${() => this.onSelected?.(provider)}"
        >
          ${provider === Providers.ViewOnly
            ? EyeIcon()
            : iconDark
            ? html`
                <svg aria-hidden="true" class="h-5 aspect-square block dark:hidden">
                  <image href="${icon}" class="h-5" />
                </svg>
                <svg aria-hidden="true" class="h-5 aspect-square hidden dark:block">
                  <image href="${iconDark}" class="h-5" />
                </svg>
              `
            : html`
                <svg aria-hidden="true" class="h-5 aspect-square">
                  <image href="${icon}" class="h-5" />
                </svg>
              `}
          <span class="flex-1 ms-3 whitespace-nowrap text-start">${name}</span>
          ${this._renderBadge(badge)}
        </button>
      </li>
    `
  }

  private _renderProviderBtnGrid(provider: Providers, forceShow: boolean) {
    if (!this._aioha.isProviderEnabled(provider) && !(forceShow && this._aioha.isProviderRegistered(provider))) {
      return html``
    }

    const { icon, iconDark } = ProviderInfo[provider]
    const name = this._getProviderName(provider)
    return html`
      <button
        type="button"
        class="flex flex-col items-center w-34 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 group hover:shadow-sm hover:cursor-pointer dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        @click="${() => this.onSelected?.(provider)}"
      >
        ${provider === Providers.ViewOnly
          ? EyeIcon(12)
          : iconDark
          ? html`
              <svg aria-hidden="true" class="h-12 aspect-square block dark:hidden">
                <image href="${icon}" class="h-12" />
              </svg>
              <svg aria-hidden="true" class="h-12 aspect-square hidden dark:block">
                <image href="${iconDark}" class="h-12" />
              </svg>
            `
          : html`
              <svg aria-hidden="true" class="h-12 aspect-square">
                <image href="${icon}" class="h-12" />
              </svg>
            `}
        <span class="mt-4 text-base font-bold dark:text-white whitespace-nowrap">${name}</span>
      </button>
    `
  }

  render() {
    return html`
      <p class="text-sm font-normal text-gray-500 dark:text-gray-300">${this._messages.t('wallet.connectInstruction')}</p>
      ${this.arrangement === 'list'
        ? html`
            <ul class="mt-4 mb-2 space-y-3">
              ${ProvidersSeq.map((p) => this._renderProviderBtnList(p, this.forceShow.includes(p)))}
            </ul>
          `
        : html`
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 mb-2">
              ${ProvidersSeq.map((p) => this._renderProviderBtnGrid(p, this.forceShow.includes(p)))}
            </div>
          `}
      ${this.helpUrl
        ? html`
            <a
              href="${this.helpUrl}"
              target="_blank"
              class="inline-flex items-center mt-2 text-xs font-normal text-gray-500 hover:underline dark:text-gray-300"
            >
              <svg class="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7.529 7.988a2.502 2.502 0 0 1 5 .191A2.441 2.441 0 0 1 10 10.582V12m-.01 3.008H10M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              ${this._messages.t('wallet.helpLink')}
            </a>
          `
        : ''}
      ${typeof this.onCancel === 'function'
        ? html`
            <button
              type="button"
              class="flex gap-2 items-center justify-center my-3 mx-auto text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800 enabled:hover:cursor-pointer disabled:hover:cursor-not-allowed"
              @click="${this.onCancel}"
            >
              ${CloseIcon(this._messages.t('action.cancel'))} ${this._messages.t('action.cancel')}
            </button>
          `
        : ''}
    `
  }
}
