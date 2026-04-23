import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { hivesignerCb } from '@aioha/aioha/build/lib/hivesigner-cb.js'
import { defaultMessages, type Messages } from '../i18n.js'
import { styles } from '../styles.js'

@customElement('hivesigner-cb')
export class HiveSignerCb extends LitElement {
  @property({ type: Boolean })
  lightMode = false

  @property({ type: String })
  language = 'en'

  @property({ attribute: false })
  messages?: Messages

  private _unsubscribe?: () => void

  private get _m(): Messages {
    return this.messages ?? defaultMessages
  }

  connectedCallback() {
    super.connectedCallback()
    this._unsubscribe = this._m.subscribe(() => this.requestUpdate())
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._unsubscribe?.()
  }

  firstUpdated() {
    this._m.setLocale(this.language)
    hivesignerCb()
  }

  render() {
    return html`
      <div class="${!this.lightMode ? 'dark' : ''}">
        <p class="ms-2 text-black dark:text-white">${this._m.t('auth.oneClick.redirecting')}</p>
      </div>
    `
  }

  static styles = styles
}
