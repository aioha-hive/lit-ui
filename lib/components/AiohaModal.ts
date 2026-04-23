import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { consume, provide } from '@lit/context'
import { type AiohaProvider, AiohaCtx, UserCtx, OtherUsersCtx } from '@aioha/providers/lit'
import type { Aioha, PersistentLoginProvs, Providers } from '@aioha/aioha'
import type { DiscoverOptions, LoginOptions, LoginResult } from '@aioha/aioha/build/types.js'
import { styles } from '../styles.js'
import { defaultMessages, MessagesCtx, type Messages } from '../i18n.js'
import type { Arrangement } from './login/ProviderSelection.js'
import './LoginModal.js'
import './UserModal.js'
import './SwitchUserModal.js'

@customElement('aioha-modal')
export class AiohaModal extends LitElement {
  @property({ type: Boolean })
  displayed = false

  @property({ type: Boolean })
  lightMode = false

  @property({ type: String })
  loginTitle?: string

  @property({ type: String })
  loginHelpUrl?: string

  @property({ attribute: false })
  loginOptions!: LoginOptions

  @property({ attribute: false })
  discOptions?: DiscoverOptions

  @property({ attribute: false })
  forceShowProviders: Providers[] = []

  @property({ type: String })
  arrangement: Arrangement = 'list'

  @property({ type: String })
  imageServer = 'https://images.hive.blog'

  @property({ type: String })
  explorerUrl = 'https://hivehub.dev'

  @property({ type: String })
  language = 'en'

  @property({ type: String })
  direction: 'ltr' | 'rtl' | 'auto' = 'auto'

  @property({ attribute: false })
  messages?: Messages

  @property({ attribute: false })
  onLogin?: (result: LoginResult) => any

  @property({ attribute: false })
  onClose?: () => any

  @consume({ context: AiohaCtx })
  private _aioha!: Aioha

  @consume({ context: UserCtx, subscribe: true })
  private _user?: string

  @consume({ context: OtherUsersCtx, subscribe: true })
  private _otherUsers!: PersistentLoginProvs

  @provide({ context: MessagesCtx })
  private _messages: Messages = defaultMessages

  private _unsubscribe?: () => void

  @state()
  private _switchingUser = false

  @state()
  private _addingAcc = false

  connectedCallback() {
    super.connectedCallback()
    this._messages = this.messages ?? defaultMessages
    this._messages.setLocale(this.language)
    this._unsubscribe = this._messages.subscribe(() => this.requestUpdate())
    const isInactive = Object.keys(this._otherUsers).length > 0 && !this._aioha.isLoggedIn()
    this._switchingUser = isInactive
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._unsubscribe?.()
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('messages')) {
      this._unsubscribe?.()
      this._messages = this.messages ?? defaultMessages
      this._messages.setLocale(this.language)
      this._unsubscribe = this._messages.subscribe(() => this.requestUpdate())
    }
    if (changedProperties.has('language')) {
      this._messages.setLocale(this.language)
      this.requestUpdate()
    }
  }

  get _isInactive() {
    return Object.keys(this._otherUsers).length > 0 && !this._aioha.isLoggedIn()
  }

  private _onClose = () => {
    if (typeof this.onClose === 'function') {
      this.onClose()
    } else {
      this.displayed = false
    }
  }

  private _handleModalMouseDown(e: MouseEvent) {
    e.stopPropagation()
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this._onClose()
    }
  }

  private _handleSelectUser = (newUser: string) => {
    if (newUser !== this._user) {
      this._aioha.switchUser(newUser)
    }
    this._switchingUser = false
  }

  private _handleLogin = (result: LoginResult) => {
    this._addingAcc = false
    this._switchingUser = false
    if (typeof this.onLogin === 'function') {
      this.onLogin(result)
    }
  }

  private _resolvedDir(): 'ltr' | 'rtl' {
    if (this.direction === 'ltr' || this.direction === 'rtl') return this.direction
    if (typeof document !== 'undefined' && document.dir === 'rtl') return 'rtl'
    return this._messages.getDir()
  }

  render() {
    const maxWClass = this.arrangement === 'grid' ? 'md:max-w-xl max-w-md' : 'max-w-md'

    if (!this.displayed) {
      return html``
    }

    return html`
      <div class="${!this.lightMode ? 'dark' : ''}" dir="${this._resolvedDir()}">
        <div
          id="aioha-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="aioha-modal-title"
          class="overflow-y-auto overflow-x-hidden fixed top-0 inset-x-0 z-50 flex justify-center items-center w-full md:inset-0 h-full bg-black/60"
          @mousedown="${this._onClose}"
          @keydown="${this._handleKeyDown}"
        >
          <div class="relative p-4 ${maxWClass} max-h-full">
            <div
              class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700 min-w-sm"
              @mousedown="${this._handleModalMouseDown}"
            >
              ${this._aioha.isLoggedIn() || Object.keys(this._otherUsers).length > 0
                ? this._switchingUser
                  ? !this._addingAcc
                    ? html`
                        <switch-user-modal
                          .onClose="${this._onClose}"
                          .onSelect="${this._handleSelectUser}"
                          .onAddAcc="${() => {
                            this._addingAcc = true
                          }}"
                        ></switch-user-modal>
                      `
                    : html`
                        <login-modal
                          loginTitle="${this._messages.t('user.addAccount')}"
                          .loginHelpUrl="${this.loginHelpUrl}"
                          .loginOptions="${this.loginOptions}"
                          .discOptions="${this.discOptions}"
                          .arrangement="${this.arrangement}"
                          .forceShowProviders="${this.forceShowProviders}"
                          .onLogin="${this._handleLogin}"
                          .onClose="${this._onClose}"
                          .onCancel="${() => {
                            this._addingAcc = false
                          }}"
                        ></login-modal>
                      `
                  : html`
                      <user-modal
                        imageServer="${this.imageServer}"
                        explorerUrl="${this.explorerUrl}"
                        .onClose="${this._onClose}"
                        .onSwitchUser="${() => {
                          this._switchingUser = true
                        }}"
                      ></user-modal>
                    `
                : html`
                    <login-modal
                      .loginTitle="${this.loginTitle}"
                      .loginHelpUrl="${this.loginHelpUrl}"
                      .loginOptions="${this.loginOptions}"
                      .discOptions="${this.discOptions}"
                      .arrangement="${this.arrangement}"
                      .forceShowProviders="${this.forceShowProviders}"
                      .onLogin="${this._handleLogin}"
                      .onClose="${this._onClose}"
                    ></login-modal>
                  `}
            </div>
          </div>
        </div>
      </div>
    `
  }

  static styles = styles
}

declare global {
  interface HTMLElementTagNameMap {
    'aioha-modal': AiohaModal
    'aioha-provider': AiohaProvider
  }
}

interface InitAiohaModalOptions {
  displayed?: boolean
  lightMode?: boolean
  loginTitle?: string
  loginHelpUrl?: string
  loginOptions: LoginOptions
  discOptions?: DiscoverOptions
  forceShowProviders?: Providers[]
  arrangement?: Arrangement
  imageServer?: string
  explorerUrl?: string
  language?: string
  direction?: 'ltr' | 'rtl' | 'auto'
  messages?: Messages
  onLogin?: (result: LoginResult) => any
  onClose?: () => any
}

export const initModal = (
  aioha: Aioha,
  element: HTMLElement,
  {
    displayed = false,
    lightMode = false,
    loginTitle,
    loginHelpUrl,
    loginOptions,
    discOptions,
    forceShowProviders = [],
    arrangement = 'list',
    imageServer = 'https://images.hive.blog',
    explorerUrl = 'https://hivehub.dev',
    language = 'en',
    direction = 'auto',
    messages,
    onLogin,
    onClose
  }: InitAiohaModalOptions
) => {
  const provider = document.createElement('aioha-provider')
  provider.aioha = aioha
  element.appendChild(provider)

  const modal = document.createElement('aioha-modal')
  modal.displayed = displayed
  modal.lightMode = lightMode
  if (loginTitle !== undefined) modal.loginTitle = loginTitle
  modal.loginHelpUrl = loginHelpUrl
  modal.loginOptions = loginOptions
  modal.discOptions = discOptions
  modal.forceShowProviders = forceShowProviders
  modal.arrangement = arrangement
  modal.imageServer = imageServer
  modal.explorerUrl = explorerUrl
  modal.language = language
  modal.direction = direction
  modal.messages = messages
  modal.onLogin = onLogin
  modal.onClose = onClose
  provider.appendChild(modal)
  return modal
}
