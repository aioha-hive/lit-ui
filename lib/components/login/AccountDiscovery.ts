import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { AiohaCtx } from '@aioha/providers/lit'
import type { Aioha, Providers } from '@aioha/aioha'
import type { DiscoverOptions } from '@aioha/aioha/build/types.js'
import { ErrorAlert } from './ErrorAlert.js'
import { BackButton } from './BackButton.js'
import { SpinningIcon } from '../Icons.js'

export interface DiscUserAuth {
  pubkey: string
  path: string
  role: string
}

@customElement('account-discovery')
export class AccountDiscovery extends LitElement {
  @property({ attribute: false })
  provider!: Providers

  @property({ attribute: false })
  options?: DiscoverOptions

  @property({ attribute: false })
  onPrevious?: () => any

  @property({ attribute: false })
  onNext?: (username: string, details: DiscUserAuth[]) => Promise<any>

  @consume({ context: AiohaCtx })
  private _aioha!: Aioha

  @state()
  private _completed = false

  @state()
  private _count = 0

  @state()
  private _error?: string

  @state()
  private _isPrompt = false

  private _discovering = false
  private _stopDiscovery: (() => void) | null = null
  private _discovered: Record<string, DiscUserAuth[]> = {}

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  connectedCallback() {
    super.connectedCallback()
    this._discover()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this._stopDiscovery) {
      this._stopDiscovery()
    }
  }

  private async _discover() {
    if (this._discovering) return
    this._discovering = true

    const result = await this._aioha.discoverAccounts(
      this.provider,
      (disc, stop) => {
        this._stopDiscovery = stop
        const d: DiscUserAuth = {
          pubkey: disc.pubkey!,
          path: disc.path!,
          role: disc.role!
        }
        if (!this._discovered[disc.username]) {
          this._discovered[disc.username] = [d]
        } else if (!this._discovered[disc.username].find((a) => a.role === d.role)) {
          this._discovered[disc.username].push(d)
        }
        this._count++
        this.requestUpdate()
      },
      this.options
    )

    this._completed = true
    if (!result.success) {
      this._error = result.error
    }
    this.requestUpdate()
  }

  private async _userSelected(user: string) {
    this._isPrompt = true
    await this.onNext?.(user, this._discovered[user])
  }

  private _handleStop() {
    if (this._stopDiscovery) {
      this._stopDiscovery()
    }
  }

  render() {
    if (this._isPrompt) {
      return html`
        <div class="flex-col gap-20 my-3">
          <svg
            class="w-20 h-20 ml-auto mr-auto text-gray-900 dark:text-gray-100"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M6 15h12M6 6h12m-6 12h.01M7 21h10a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1Z"
            />
          </svg>
          <div class="text-lg my-3 text-gray-900 dark:text-gray-100 text-center">Please approve login request on the device.</div>
        </div>
      `
    }

    return html`
      <div class="flex-col gap-3">
        <div class="mb-3 w-full">${BackButton(() => this.onPrevious?.())}</div>
        ${this._error ? ErrorAlert(this._error) : ''}
        ${Object.keys(this._discovered).length > 0
          ? html`
              <div class="w-full overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
                    ${Object.entries(this._discovered).map(
                      ([username, auths]) => html`
                        <tr
                          class="hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                          @click="${() => this._userSelected(username)}"
                        >
                          <td class="px-3 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">${username}</div>
                          </td>
                          <td class="px-3 py-4 whitespace-nowrap">
                            <div class="flex flex-wrap gap-2">
                              ${auths.map(
                                (auth) => html`
                                  <span
                                    class="px-2 inline-flex text-xs leading-5 font-semplify rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  >
                                    ${auth.role}
                                  </span>
                                `
                              )}
                            </div>
                          </td>
                          <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <svg
                              class="w-5 h-5 text-gray-400 dark:text-gray-400 ml-auto"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m9 5 7 7-7 7"
                              />
                            </svg>
                          </td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `
          : ''}
        ${!this._completed
          ? html`
              <button
                type="button"
                class="flex gap-2 items-center justify-center mt-3 ml-auto mr-auto text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800 enabled:hover:cursor-pointer disabled:hover:cursor-not-allowed"
                @click="${this._handleStop}"
                ?disabled="${this._count === 0}"
              >
                ${SpinningIcon(5)}Stop
              </button>
            `
          : ''}
      </div>
    `
  }
}
