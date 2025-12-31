import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { type AiohaProvider, AiohaCtx, UserCtx, OtherUsersCtx } from '@aioha/providers/lit'
import type { Aioha, PersistentLoginProvs, Providers } from '@aioha/aioha'
import type { DiscoverOptions, LoginOptions, LoginResult } from '@aioha/aioha/build/types.js'
import { styles } from '../styles.js'
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
  loginTitle: string = 'Connect Wallet'

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

  @state()
  private _switchingUser = false

  @state()
  private _addingAcc = false

  connectedCallback() {
    super.connectedCallback()
    const isInactive = Object.keys(this._otherUsers).length > 0 && !this._aioha.isLoggedIn()
    this._switchingUser = isInactive
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

  render() {
    const maxWClass = this.arrangement === 'grid' ? 'md:max-w-xl max-w-md' : 'max-w-md'

    if (!this.displayed) {
      return html``
    }

    return html`
      <div class="${!this.lightMode ? 'dark' : ''}">
        <div
          id="aioha-modal"
          tabindex="-1"
          class="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full md:inset-0 h-full bg-black/60"
          @mousedown="${this._onClose}"
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
                          loginTitle="Add Account"
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
  onLogin?: (result: LoginResult) => any
  onClose?: () => any
}

export const initModal = (
  aioha: Aioha,
  element: HTMLElement,
  {
    displayed = false,
    lightMode = false,
    loginTitle = 'Connect Wallet',
    loginHelpUrl,
    loginOptions,
    discOptions,
    forceShowProviders = [],
    arrangement = 'list',
    imageServer = 'https://images.hive.blog',
    explorerUrl = 'https://hivehub.dev',
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
  modal.loginTitle = loginTitle
  modal.loginHelpUrl = loginHelpUrl
  modal.loginOptions = loginOptions
  modal.discOptions = discOptions
  modal.forceShowProviders = forceShowProviders
  modal.arrangement = arrangement
  modal.imageServer = imageServer
  modal.explorerUrl = explorerUrl
  modal.onLogin = onLogin
  modal.onClose = onClose
  provider.appendChild(modal)
  return modal
}
