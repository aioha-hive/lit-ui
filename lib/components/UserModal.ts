import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { AiohaCtx, UserCtx, OtherUsersCtx } from '@aioha/providers/lit'
import type { Aioha, PersistentLoginProvs } from '@aioha/aioha'
import { CloseIcon } from './Icons.js'

@customElement('user-modal')
export class UserModal extends LitElement {
  @property()
  imageServer = 'https://images.hive.blog'

  @property()
  explorerUrl = 'https://hivehub.dev'

  @property({ attribute: false })
  onClose!: () => any

  @property({ attribute: false })
  onSwitchUser!: () => any

  @consume({ context: AiohaCtx })
  private _aioha!: Aioha

  @consume({ context: UserCtx, subscribe: true })
  private _user?: string

  @consume({ context: OtherUsersCtx, subscribe: true })
  private _otherUsers!: PersistentLoginProvs

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  private async _handleLogout() {
    await this._aioha.logout()
    this.onClose()
    if (Object.keys(this._otherUsers).length > 0) {
      this.onSwitchUser()
    }
  }

  render() {
    if (!this._user) return html``

    return html`
      <button
        type="button"
        class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
        @click="${this.onClose}"
        aria-label="Close"
      >
        ${CloseIcon()}
      </button>
      <div class="p-4 md:p-5 flex flex-col place-content-center text-center">
        <div class="my-3">
          <img
            class="w-16 h-16 mx-auto rounded-full"
            src="${this.imageServer}/u/${this._user}/avatar"
            alt="${this._user}'s avatar"
          />
          <h3 class="text-lg font-semibold my-2 text-gray-900 dark:text-white">${this._user}</h3>
        </div>
        <div class="flex flex-col rounded-md shadow-xs mx-auto w-full" role="group">
          <button
            type="button"
            class="flex-1 px-4 py-2 text-sm font-medium hover:cursor-pointer text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 dark:bg-gray-600 dark:border-gray-700 dark:text-white dark:hover:bg-gray-500 rounded-t-lg"
            @click="${() => window.open(`${this.explorerUrl}/@${this._user}`)}"
          >
            View In Explorer
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2 text-sm font-medium hover:cursor-pointer text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 dark:bg-gray-600 dark:border-gray-700 dark:text-white dark:hover:bg-gray-500"
            @click="${this.onSwitchUser}"
          >
            Switch User
          </button>
          <button
            type="button"
            class="flex-1 px-4 py-2 text-sm font-medium hover:cursor-pointer text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 dark:bg-gray-600 dark:border-gray-700 dark:text-white dark:hover:bg-gray-500 rounded-b-lg"
            @click="${this._handleLogout}"
          >
            Logout
          </button>
        </div>
      </div>
    `
  }
}
