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

const VIEW_ORDER: Record<string, number> = { login: 0, user: 1, switch: 2, add: 3 }

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

  @state()
  private _isMounted = false

  @state()
  private _isOpen = false

  @state()
  private _viewIn = true

  @state()
  private _innerWidth?: number

  @state()
  private _innerHeight?: number

  @state()
  private _sizeReady = false

  @state()
  private _dir: 'fwd' | 'back' = 'fwd'

  private _closeTimer?: number
  private _prevViewKey = ''
  private _sizeObserver?: ResizeObserver
  private _sizeInnerEl?: HTMLElement | null
  private _sizeReadyTimer?: number

  private get _viewKey(): string {
    if (this._aioha.isLoggedIn() || Object.keys(this._otherUsers).length > 0) {
      return this._switchingUser ? (this._addingAcc ? 'add' : 'switch') : 'user'
    }
    return 'login'
  }

  connectedCallback() {
    super.connectedCallback()
    this._messages = this.messages ?? defaultMessages
    this._messages.setLocale(this.language)
    this._unsubscribe = this._messages.subscribe(() => this.requestUpdate())
    const isInactive = Object.keys(this._otherUsers).length > 0 && !this._aioha.isLoggedIn()
    this._switchingUser = isInactive
    this._isMounted = this.displayed
    if (this.displayed) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._isOpen = true
        })
      })
    }
    this._prevViewKey = this._viewKey
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    clearTimeout(this._closeTimer)
    clearTimeout(this._sizeReadyTimer)
    this._sizeObserver?.disconnect()
    this._sizeObserver = undefined
    this._sizeInnerEl = undefined
    this._unsubscribe?.()
  }

  willUpdate(_changedProperties: Map<string, unknown>) {
    const k = this._viewKey
    if (this._prevViewKey && this._prevViewKey !== k) {
      this._dir = (VIEW_ORDER[k] ?? 0) >= (VIEW_ORDER[this._prevViewKey] ?? 0) ? 'fwd' : 'back'
      this._viewIn = false
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this._viewIn = true
        })
      })
    }
    this._prevViewKey = k
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
    if (changedProperties.has('displayed')) {
      if (this.displayed) {
        clearTimeout(this._closeTimer)
        this._isMounted = true
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this._isOpen = true
          })
        })
      } else if (this._isMounted) {
        this._isOpen = false
        this._closeTimer = window.setTimeout(() => {
          this._isMounted = false
        }, 200)
      }
    }

    if (this._isMounted) {
      const inner = this.shadowRoot?.querySelector('.aioha-h-inner') as HTMLElement | null
      if (inner && inner !== this._sizeInnerEl) {
        this._sizeObserver?.disconnect()
        clearTimeout(this._sizeReadyTimer)
        this._sizeReady = false
        this._sizeInnerEl = inner
        this._sizeObserver = new ResizeObserver(() => {
          if (this._sizeInnerEl) {
            this._innerWidth = this._sizeInnerEl.offsetWidth
            this._innerHeight = this._sizeInnerEl.offsetHeight
          }
        })
        this._sizeObserver.observe(inner)
        this._innerWidth = inner.offsetWidth
        this._innerHeight = inner.offsetHeight
        this._sizeReadyTimer = window.setTimeout(() => {
          this._sizeReady = true
        }, 200)
      }
    } else if (this._sizeInnerEl) {
      this._sizeObserver?.disconnect()
      this._sizeObserver = undefined
      clearTimeout(this._sizeReadyTimer)
      this._sizeReadyTimer = undefined
      this._sizeReady = false
      this._sizeInnerEl = undefined
      this._innerWidth = undefined
      this._innerHeight = undefined
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

    if (!this._isMounted) {
      return html``
    }

    const backdropCls = `overflow-y-auto overflow-x-hidden fixed top-0 inset-x-0 z-50 flex justify-center items-center w-full md:inset-0 h-full bg-black/60 transition-opacity duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
      this._isOpen ? 'opacity-100' : 'opacity-0'
    }`
    const panelCls = `relative bg-white rounded-lg shadow-sm dark:bg-gray-700 transition-[opacity,translate,scale] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
      this._isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
    }`
    const viewCls = `transition-[opacity,translate,scale] duration-200 motion-reduce:transition-none ease-[cubic-bezier(0.32,0.72,0,1)] ${
      this._viewIn
        ? 'opacity-100 translate-x-0'
        : this._dir === 'fwd'
          ? 'opacity-0 translate-x-2'
          : 'opacity-0 -translate-x-2'
    }`
    const sizeStyle =
      this._innerWidth !== undefined
        ? `width: ${this._innerWidth}px;${this._innerHeight !== undefined ? ` height: ${this._innerHeight}px;` : ''}`
        : ''

    return html`
      <div class="${!this.lightMode ? 'dark' : ''}" dir="${this._resolvedDir()}">
        <div
          id="aioha-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="aioha-modal-title"
          class="${backdropCls}"
          @mousedown="${this._onClose}"
          @keydown="${this._handleKeyDown}"
        >
          <div class="relative p-4 ${maxWClass} max-h-full">
            <div class="${panelCls}" @mousedown="${this._handleModalMouseDown}">
              <div
                class="${`overflow-hidden ${
                  this._sizeReady
                    ? 'transition-[width,height] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none'
                    : ''
                }`}"
                style="${sizeStyle}"
              >
                <div class="aioha-h-inner w-max min-w-sm">
                  <div class="${viewCls}">
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
