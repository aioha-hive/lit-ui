import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { BackButton } from './BackButton.js'
import { SpinningIcon } from '../Icons.js'

@customElement('username-input')
export class UsernameInput extends LitElement {
  @property({ attribute: false })
  onPrevious?: () => any

  @property({ attribute: false })
  onNext?: (username: string) => Promise<any>

  @state()
  private _username = ''

  @state()
  private _inProgress = false

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  private async _proceed() {
    if (!this.onNext) return
    this._inProgress = true
    await this.onNext(this._username)
    this._inProgress = false
  }

  private _handleInput(e: Event) {
    const target = e.target as HTMLInputElement
    this._username = target.value
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this._proceed()
    }
  }

  render() {
    return html`
      <div class="mb-3">${BackButton(() => this.onPrevious?.())}</div>
      <div class="inline-flex flex-row gap-1.5 w-full">
        <input
          type="text"
          id="small-input"
          class="bg-gray-50 border border-gray-300 text-gray-900 h-auto text-sm rounded-lg focus:outline-hidden focus:border-gray-900 grow p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-white"
          placeholder="Enter Hive Username"
          autocapitalize="off"
          .value="${this._username}"
          @input="${this._handleInput}"
          @keydown="${this._handleKeyDown}"
          ?disabled="${this._inProgress}"
        />
        <button
          type="button"
          class="text-gray-900 bg-white border border-gray-300 focus:outline-hidden hover:bg-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 items-center flex-none dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-500 dark:hover:border-gray-500 cursor-pointer"
          @click="${this._proceed}"
          aria-label="Proceed"
          ?disabled="${this._inProgress}"
        >
          ${this._inProgress
            ? SpinningIcon()
            : html`
                <svg
                  class="w-6 h-6 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" />
                </svg>
              `}
        </button>
      </div>
    `
  }
}
