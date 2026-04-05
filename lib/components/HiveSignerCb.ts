import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { hivesignerCb } from '@aioha/aioha/build/lib/hivesigner-cb.js'
import { i18n } from '../i18n.js'
import { styles } from '../styles.js'

@customElement('hivesigner-cb')
export class HiveSignerCb extends LitElement {
  @property({ type: Boolean })
  lightMode = false

  @property({ type: String })
  language = 'en'

  firstUpdated() {
    i18n.changeLanguage(this.language)
    hivesignerCb()
  }

  render() {
    return html`
      <div class="${!this.lightMode ? 'dark' : ''}">
        <p class="ml-2 text-black dark:text-white">${i18n.t('redirectingBack')}</p>
      </div>
    `
  }

  static styles = styles
}
