import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { type Aioha, Providers } from '@aioha/aioha'
import { AiohaCtx } from '@aioha/providers/lit'
import { defaultMessages, type Messages } from '../i18n.js'
import { styles } from '../styles.js'

@customElement('hivesigner-ocl')
export class HiveSignerOcl extends LitElement {
  @consume({ context: AiohaCtx })
  aioha!: Aioha

  @property({ type: Boolean })
  lightMode = false

  @property({ type: String })
  language = 'en'

  @property({ attribute: false })
  messages?: Messages

  @property({ attribute: false })
  onSuccess!: () => any

  @state()
  error?: string

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
    const url = new URL(window.location.href)
    const loginResult = this.aioha.loginNonInteractive(Providers.HiveSigner, url.searchParams.get('username')!, {
      ignorePersistence: url.searchParams.get('force') === 'true',
      hivesigner: {
        accessToken: url.searchParams.get('access_token')!,
        expiry: parseInt(url.searchParams.get('expiry')!)
      }
    })
    if (!loginResult.success) {
      this.error = loginResult.error
    } else {
      this.onSuccess()
    }
  }

  render() {
    return html`
      <div class="${!this.lightMode ? 'dark' : ''}">
        <p class="ms-2 text-black dark:text-white">
          ${!!this.error ? this._m.t('auth.oneClick.failed', { error: this.error }) : this._m.t('auth.oneClick.logging')}
        </p>
      </div>
    `
  }

  static styles = styles
}
