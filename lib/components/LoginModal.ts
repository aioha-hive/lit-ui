import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { AiohaCtx } from '@aioha/providers/lit'
import type { Aioha } from '@aioha/aioha'
import { Providers } from '@aioha/aioha'
import type { DiscoverOptions, LoginOptions, LoginResult } from '@aioha/aioha/build/types.js'
import type { i18n as I18nInstance } from 'i18next'
import { I18nCtx } from '../i18n.js'
import type { Arrangement } from './login/ProviderSelection.js'
import type { DiscUserAuth } from './login/AccountDiscovery.js'
import { ErrorAlert } from './login/ErrorAlert.js'
import { CloseIcon } from './Icons.js'
import { ProviderInfo } from './ProviderInfo.js'
import './login/ProviderSelection.js'
import './login/UsernameInput.js'
import './login/AccountDiscovery.js'
import './login/HiveAuthQR.js'

@customElement('login-modal')
export class LoginModal extends LitElement {
  @property({ type: String })
  loginTitle = 'Connect Wallet'

  @property({ type: String })
  loginHelpUrl?: string

  @property({ attribute: false })
  loginOptions!: LoginOptions

  @property({ attribute: false })
  discOptions?: DiscoverOptions

  @property({ attribute: false })
  arrangement: Arrangement = 'list'

  @property({ attribute: false })
  forceShowProviders: Providers[] = []

  @property({ attribute: false })
  onLogin?: (result: LoginResult) => any

  @property({ attribute: false })
  onCancel?: () => any

  @property({ attribute: false })
  onClose!: () => any

  @consume({ context: AiohaCtx })
  private _aioha!: Aioha

  @consume({ context: I18nCtx, subscribe: true })
  private _i18n!: I18nInstance

  @state()
  private _page = 0

  @state()
  private _chosenProvider?: Providers

  @state()
  private _error = ''

  @state()
  private _hiveAuthPl?: { payload: string; cancel: () => void }

  private _hiveAuthHandler?: (payload: string, _: any, cancel: () => void) => void

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  connectedCallback() {
    super.connectedCallback()
    this._hiveAuthHandler = (payload: string, _: any, cancel: () => void) => {
      this._error = ''
      this._hiveAuthPl = { payload, cancel }
      this._page = 2
    }
    this._aioha.on('hiveauth_login_request', this._hiveAuthHandler)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this._hiveAuthHandler) {
      this._aioha.off('hiveauth_login_request', this._hiveAuthHandler)
    }
  }

  private async _login(provider: Providers, username: string, options: LoginOptions) {
    const loginResult = await this._aioha.login(provider, username, {
      ...options,
      hiveauth: {
        cbWait: () => {}
      }
    })
    if (!loginResult.success) {
      this._error = loginResult.error
      if (provider !== Providers.HiveSigner) this._page = 1
    } else {
      if (typeof this.onLogin === 'function') this.onLogin(loginResult)
      this.onClose()
    }
    return loginResult
  }

  private _handleProviderSelected = async (provider: Providers) => {
    if (!this._aioha.isProviderEnabled(provider)) {
      if (ProviderInfo[provider].url) {
        window.open(ProviderInfo[provider].url, '_blank', 'noopener,noreferrer')
      }
      return
    }
    this._chosenProvider = provider
    if (provider === Providers.HiveSigner) {
      await this._login(provider, '', {})
    } else if (ProviderInfo[provider].discovery) {
      this._error = ''
      this._page = 3
    } else {
      this._error = ''
      this._page = 1
    }
  }

  private _handleUsernamePrevious = () => {
    this._error = ''
    this._page = 0
  }

  private _handleUsernameNext = async (username: string) => {
    if (this._chosenProvider) {
      await this._login(this._chosenProvider, username, this.loginOptions)
    }
  }

  private _handleDiscoveryPrevious = () => {
    this._page = 0
  }

  private _handleDiscoveryNext = async (username: string, info: DiscUserAuth[]) => {
    if (this._chosenProvider) {
      await this._login(this._chosenProvider, username, { ...this.loginOptions, paths: info.map((v) => v.path) })
    }
  }

  render() {
    return html`
      <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
        <h3 id="aioha-modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">${this.loginTitle}</h3>
        <button
          type="button"
          class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
          @click="${this.onClose}"
        >
          ${CloseIcon(this._i18n.t('closeModal'))}
        </button>
      </div>
      <div class="p-4 md:p-5">
        ${this._error ? ErrorAlert(this._error) : ''}
        ${this._page === 0
          ? html`
              <provider-selection
                helpUrl="${this.loginHelpUrl || ''}"
                .forceShow="${this.forceShowProviders}"
                .arrangement="${this.arrangement}"
                .onCancel="${this.onCancel}"
                .onSelected="${this._handleProviderSelected}"
              ></provider-selection>
            `
          : ''}
        ${this._page === 1
          ? html`
              <username-input
                .onPrevious="${this._handleUsernamePrevious}"
                .onNext="${this._handleUsernameNext}"
              ></username-input>
            `
          : ''}
        ${this._page === 2 && this._hiveAuthPl
          ? html` <hive-auth-qr payload="${this._hiveAuthPl.payload}" .cancel="${this._hiveAuthPl.cancel}"></hive-auth-qr> `
          : ''}
        ${this._page === 3 && this._chosenProvider
          ? html`
              <account-discovery
                .provider="${this._chosenProvider}"
                .options="${this.discOptions}"
                .onPrevious="${this._handleDiscoveryPrevious}"
                .onNext="${this._handleDiscoveryNext}"
              ></account-discovery>
            `
          : ''}
      </div>
    `
  }
}
