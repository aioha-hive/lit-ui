import { LitElement, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { MessagesController } from '../../messages-controller.js'
import QRCode from 'qrcode'

@customElement('hive-auth-qr')
export class HiveAuthQR extends LitElement {
  @property({ type: String })
  payload = ''

  @property({ attribute: false })
  cancel?: () => void

  private _messages = new MessagesController(this)

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  protected firstUpdated(): void {
    this._renderQRCode()
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('payload')) {
      this._renderQRCode()
    }
  }

  private async _renderQRCode() {
    const canvas = this.renderRoot?.querySelector('canvas') as HTMLCanvasElement

    if (!canvas || !this.payload) return

    try {
      await QRCode.toCanvas(canvas, this.payload, {
        width: 250,
        margin: 1
      })
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  private _handleCancel() {
    if (this.cancel) {
      this.cancel()
    }
  }

  render() {
    return html`
      <p class="text-sm font-normal max-w-93.75 text-gray-500 dark:text-gray-300">
        ${this._messages.t('auth.hiveauth.instruction')}
      </p>

      <div class="bg-white p-4 w-64 aspect-square mx-auto my-5">
        <a href="${this.payload}" target="_blank" rel="noopener noreferrer" aria-label="${this._messages.t('auth.hiveauth.openLink')}">
          <div class="h-full w-full flex items-center justify-center">
            <canvas></canvas>
          </div>
        </a>
      </div>

      <div class="w-full flex place-content-center">
        <button
          type="button"
          class="text-gray-900 bg-white border border-gray-300 focus:outline-hidden hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-800 cursor-pointer"
          @click="${this._handleCancel}"
        >
          ${this._messages.t('action.cancel')}
        </button>
      </div>
    `
  }
}
