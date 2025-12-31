import { UserCtx } from '@aioha/providers/lit'
import { KeyTypes } from '@aioha/aioha'
import type { LoginResult } from '@aioha/aioha/build/types.js'
import { consume } from '@lit/context'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { styles } from '../lib/styles.js'
import '../lib'

@customElement('home-page')
export class Homepage extends LitElement {
  @consume({ context: UserCtx, subscribe: true })
  @state()
  private _user?: string

  @state()
  private _aiohaModalDisplayed: boolean

  constructor() {
    super()
    this._aiohaModalDisplayed = false
  }

  private _handleButtonClick() {
    this._aiohaModalDisplayed = true
  }

  render() {
    return html`
      <div class="dark">
        <button
          type="button"
          class="text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:outline-hidden focus:ring-gray-100 hover:cursor-pointer font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
          @click="${this._handleButtonClick}"
        >
          ${this._user ?? 'Connect Wallet'}
        </button>
        <aioha-modal
          ?displayed="${this._aiohaModalDisplayed}"
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
