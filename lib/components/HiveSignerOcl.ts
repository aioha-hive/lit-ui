import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { consume } from '@lit/context'
import { type Aioha, Providers } from '@aioha/aioha'
import { AiohaCtx } from '@aioha/providers/lit'
import { i18n } from '../i18n.js'
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
  onSuccess!: () => any

  @state()
  error?: string

  firstUpdated() {
    i18n.changeLanguage(this.language)
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
        <p className="ml-2 text-black dark:text-white">
          ${!!this.error ? i18n.t('failedOneClickLogin', { error: this.error }) : i18n.t('loggingInOneClick')}
        </p>
      </div>
    `
  }

  static styles = styles
}
