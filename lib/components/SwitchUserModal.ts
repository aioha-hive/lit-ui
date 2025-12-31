import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { AiohaCtx, UserCtx, ProviderCtx, OtherUsersCtx } from '@aioha/providers/lit'
import type { Aioha, Providers, PersistentLoginProvs } from '@aioha/aioha'
import { CloseIcon, PlusIcon, EditIcon } from './Icons.js'
import { RightAngledArrow, RmRowIcon } from './TableUtils.js'
import { ProviderInfo } from './ProviderInfo.js'

@customElement('switch-user-modal')
export class SwitchUserModal extends LitElement {
  @property({ attribute: false })
  onClose!: () => any

  @property({ attribute: false })
  onSelect!: (user: string) => any

  @property({ attribute: false })
  onAddAcc!: () => any

  @consume({ context: AiohaCtx })
  private _aioha!: Aioha

  @consume({ context: UserCtx, subscribe: true })
  private _user?: string

  @consume({ context: ProviderCtx, subscribe: true })
  private _provider?: Providers

  @consume({ context: OtherUsersCtx, subscribe: true })
  private _otherUsers!: PersistentLoginProvs

  @state()
  private _editing = false

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
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

  private async _handleUserClick(selected: string) {
    if (this._editing) {
      if (selected === this._user) {
        await this._aioha.logout()
      } else {
        this._aioha.removeOtherLogin(selected)
      }
    } else {
      this.onSelect(selected)
    }
  }

  render() {
    return html`
      <div class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Switch User</h3>
        <button
          type="button"
          class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
          @click="${this.onClose}"
        >
          ${CloseIcon()}
        </button>
      </div>
      <div class="w-full overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
            ${this._user
              ? html`
                  <tr
                    class="hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                    @click="${() => this._handleUserClick(this._user!)}"
                  >
                    <td class="px-5 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${this._user}</div>
                    </td>
                    <td class="px-3 py-4 whitespace-nowrap">
                      ${this._renderBadge(this._provider ? ProviderInfo[this._provider].name : undefined)}
                    </td>
                    ${this._editing ? RmRowIcon(12) : RightAngledArrow(12)}
                  </tr>
                `
              : ''}
            ${Object.keys(this._otherUsers).map(
              (u) => html`
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer" @click="${() => this._handleUserClick(u)}">
                  <td class="px-5 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${u}</div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap">
                    ${this._renderBadge(this._otherUsers[u] ? ProviderInfo[this._otherUsers[u]].name : undefined)}
                  </td>
                  ${this._editing ? RmRowIcon(12) : RightAngledArrow(12)}
                </tr>
              `
            )}
          </tbody>
        </table>
        ${this._editing
          ? html`
              <div class="flex gap-2 my-5 mx-auto justify-center">
                <button
                  type="button"
                  class="flex gap-1 items-center justify-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800 enabled:hover:cursor-pointer disabled:hover:cursor-not-allowed"
                  @click="${() => {
                    this._editing = false
                  }}"
                >
                  Done
                </button>
              </div>
            `
          : html`
              <div class="flex gap-2 my-5 mx-auto justify-center">
                <button
                  type="button"
                  class="flex gap-1 items-center justify-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 font-medium rounded-lg text-sm pl-3.5 pr-4 py-2.5 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800 enabled:hover:cursor-pointer disabled:hover:cursor-not-allowed"
                  @click="${() => {
                    this._editing = true
                  }}"
                >
                  ${EditIcon()} Edit
                </button>
                <button
                  type="button"
                  class="flex gap-1 items-center justify-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 font-medium rounded-lg text-sm pl-3 pr-4 py-2.5 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800 enabled:hover:cursor-pointer disabled:hover:cursor-not-allowed"
                  @click="${this.onAddAcc}"
                >
                  ${PlusIcon()} Add account
                </button>
              </div>
            `}
      </div>
    `
  }
}
