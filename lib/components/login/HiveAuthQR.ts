import { LitElement, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { consume } from '@lit/context'
import type { i18n as I18nInstance } from 'i18next'
import { I18nCtx } from '../../i18n.js'
import QRCode from 'qrcode'

@customElement('hive-auth-qr')
export class HiveAuthQR extends LitElement {
  @property({ type: String })
  payload = ''

  @property({ attribute: false })
  cancel?: () => void

  @consume({ context: I18nCtx, subscribe: true })
  private _i18n!: I18nInstance

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
    // FIX: Find the canvas directly within the component's shadow root.
    // this.renderRoot refers to the Shadow DOM of this element.
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
        ${this._i18n.t('hiveAuthInstruction')}
      </p>

      <div class="bg-white p-4 w-64 aspect-square mx-auto my-5">
        <a href="${this.payload}" target="_blank" rel="noopener noreferrer" aria-label="${this._i18n.t('openHiveAuthLink')}">
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
          ${this._i18n.t('cancel')}
        </button>
      </div>
    `
  }
}
